"use client";

import { Suspense, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Html, useGLTF, Bounds } from "@react-three/drei";
import {
  AgXToneMapping,
  Box3,
  Vector3,
  Mesh,
  MeshStandardMaterial,
  MeshPhysicalMaterial,
  CanvasTexture,
  RepeatWrapping,
} from "three";
import { useTranslations } from "next-intl";
import type { CustomizationGroup } from "@/types/products";

// ── Texturas procedurales ────────────────────────────────────────────────────

/**
 * Genera una textura de fibra de carbono twill 2×2 usando Canvas2D.
 * Cada celda representa un bundle de fibras con gradiente que simula
 * la curvatura redondeada del haz. Las celdas alternan dirección H/V
 * siguiendo el patrón de tejido diagonal característico del twill.
 */
function createCarbonFiberTexture(): CanvasTexture {
  const CELL = 8;   // px por bundle de fibras
  const REP  = 4;   // celdas por ciclo de patrón (twill 2×2 → unidad 4×4)
  const SIZE = CELL * REP; // canvas 32×32 px que se tilesea

  const canvas = document.createElement("canvas");
  canvas.width  = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d")!;

  // Base muy oscura: el hueco/surco entre bundles
  ctx.fillStyle = "#020202";
  ctx.fillRect(0, 0, SIZE, SIZE);

  for (let row = 0; row < REP; row++) {
    for (let col = 0; col < REP; col++) {
      const x = col * CELL;
      const y = row * CELL;

      // Patrón twill 2×2: la fase desplaza 1 columna por fila
      // creando la diagonal característica
      const phase = (col * 2 + row) % 4;
      const horizontal = phase < 2;

      // 1 px de margen = surco entre fibras
      const pad = 1;

      // Gradiente que simula la sección cilíndrica del bundle:
      // oscuro en los bordes, un poco más claro en el centro
      const grad = horizontal
        ? ctx.createLinearGradient(x, y + pad, x, y + CELL - pad)
        : ctx.createLinearGradient(x + pad, y, x + CELL - pad, y);

      grad.addColorStop(0,    "#080707");
      grad.addColorStop(0.25, "#1a1717");
      grad.addColorStop(0.5,  "#222020"); // punto más alto del bundle
      grad.addColorStop(0.75, "#141212");
      grad.addColorStop(1,    "#060505");

      ctx.fillStyle = grad;
      ctx.fillRect(x + pad, y + pad, CELL - pad * 2, CELL - pad * 2);
    }
  }

  const tex = new CanvasTexture(canvas);
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  // Cuántas veces se repite el patrón sobre la superficie UV (0–1).
  // Ajustar si el tejido se ve demasiado fino o grueso en el modelo.
  tex.repeat.set(2, 2);
  return tex;
}

// ── Diccionario de materiales ────────────────────────────────────────────────
// Las claves deben coincidir exactamente con el nombre del material en el GLB.
//
// Propiedades disponibles (MeshStandardMaterial):
//   color            hex "#rrggbb"   — color base del material
//   roughness        0–1             — 0 = espejo perfecto, 1 = completamente mate
//   metalness        0–1             — 0 = dieléctrico (plástico), 1 = metal puro
//   envMapIntensity  0–∞ (def. 1)   — intensidad de la reflexión del entorno (reflectancia)
//   createMap        función         — generador de textura procedural (color/albedo)
//
// Propiedades avanzadas (activan MeshPhysicalMaterial automáticamente):
//   clearcoat         0–1            — capa de barniz sobre el material base
//   clearcoatRoughness 0–1           — rugosidad del barniz (0=espejo, 1=mate)
//   anisotropy        0–1            — reflejos direccionales (metal cepillado)
//   anisotropyRotation 0–2π (rad)   — ángulo del cepillado (0 = horizontal)
//   iridescence       0–1            — efecto tornasolado (aluminio anodizado, aceite)
//   iridescenceIOR    número (def. 1.3) — índice de refracción de la capa iridiscente
//
type MaterialOverride = {
  // MeshStandardMaterial
  color?: string;
  roughness?: number;
  metalness?: number;
  envMapIntensity?: number;
  createMap?: () => CanvasTexture;
  // MeshPhysicalMaterial (se aplican automáticamente si se definen)
  clearcoat?: number;
  clearcoatRoughness?: number;
  anisotropy?: number;
  anisotropyRotation?: number;
  iridescence?: number;
  iridescenceIOR?: number;
};

const MATERIAL_OVERRIDES: Record<string, MaterialOverride> = {
  // Aluminio anodizado negro: óxido superficial brillante, alto brillo
  "Aluminio - Anodizado brillante (negro)": {
    color: "#0a0a0a",
    roughness: 0.12,
    metalness: 0.9,
  },
  // Aluminio anodizado azul
  "Aluminum - Anodized Glossy (Blue)": {
    color: "#1555e0",
    roughness: 0.12,
    metalness: 0.9,
  },
  // Aluminio anodizado rojo
  "Aluminum - Anodized Glossy (Red)": {
    color: "#c41a20",
    roughness: 0.12,
    metalness: 0.9,
  },
  // Fibra de carbono twill: patrón tejido con barniz protector semi-brillante
  "Carbon Fiber - Twill": {
    roughness: 0.9,
    metalness: 0.0,
    clearcoat: 0.1,
    clearcoatRoughness: 0.9,
    createMap: createCarbonFiberTexture,
  },
  // Nylon SLS reforzado con fibra de carbono: superficie granular muy mate
  "PA 12 - Nylon - PA 603-CF (with EOS P 3D Printers)": {
    color: "#000000",
    roughness: 0.97,
    metalness: 0.0,
    envMapIntensity: 0.05,
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Devuelve true si el override usa alguna propiedad exclusiva de MeshPhysicalMaterial */
function needsPhysical(o: MaterialOverride): boolean {
  return (
    o.clearcoat !== undefined ||
    o.clearcoatRoughness !== undefined ||
    o.anisotropy !== undefined ||
    o.anisotropyRotation !== undefined ||
    o.iridescence !== undefined ||
    o.iridescenceIOR !== undefined
  );
}

/** Aplica un MaterialOverride sobre un material clonado (Standard o Physical) */
function applyOverride(
  src: MeshStandardMaterial,
  override: MaterialOverride,
): MeshStandardMaterial | MeshPhysicalMaterial {
  // MeshPhysicalMaterial.copy() falla si src es MeshStandardMaterial porque intenta
  // acceder a propiedades exclusivas (clearcoatNormalScale, etc.) que no existen.
  // Solución: construir MeshPhysicalMaterial copiando solo las propiedades estándar.
  const m: MeshPhysicalMaterial | MeshStandardMaterial = needsPhysical(override)
    ? new MeshPhysicalMaterial({
        name: src.name,
        color: src.color,
        roughness: src.roughness,
        metalness: src.metalness,
        map: src.map,
        normalMap: src.normalMap,
        normalScale: src.normalScale,
        roughnessMap: src.roughnessMap,
        metalnessMap: src.metalnessMap,
        aoMap: src.aoMap,
        aoMapIntensity: src.aoMapIntensity,
        emissive: src.emissive,
        emissiveIntensity: src.emissiveIntensity,
        emissiveMap: src.emissiveMap,
        envMapIntensity: src.envMapIntensity,
        transparent: src.transparent,
        opacity: src.opacity,
        side: src.side,
      })
    : src.clone();

  if (override.color !== undefined) m.color.set(override.color);
  if (override.roughness !== undefined) m.roughness = override.roughness;
  if (override.metalness !== undefined) m.metalness = override.metalness;
  if (override.envMapIntensity !== undefined) m.envMapIntensity = override.envMapIntensity;
  if (override.createMap !== undefined) {
    m.map = override.createMap();
    m.map.needsUpdate = true;
  }

  if (m instanceof MeshPhysicalMaterial) {
    if (override.clearcoat !== undefined) m.clearcoat = override.clearcoat;
    if (override.clearcoatRoughness !== undefined) m.clearcoatRoughness = override.clearcoatRoughness;
    if (override.anisotropy !== undefined) m.anisotropy = override.anisotropy;
    if (override.anisotropyRotation !== undefined) m.anisotropyRotation = override.anisotropyRotation;
    if (override.iridescence !== undefined) m.iridescence = override.iridescence;
    if (override.iridescenceIOR !== undefined) m.iridescenceIOR = override.iridescenceIOR;
  }

  m.needsUpdate = true;
  return m;
}

// ── Componentes ──────────────────────────────────────────────────────────────

interface ConfiguratorViewerProps {
  modelUrl: string;
  groups: CustomizationGroup[];
  selections: Record<string, string | null>;
}

interface ModelProps {
  url: string;
  groups: CustomizationGroup[];
  selections: Record<string, string | null>;
}

function Model({ url, groups, selections }: ModelProps) {
  const { scene } = useGLTF(url);

  const clonedScene = useMemo(() => {
    const clone = scene.clone(true);

    // ── Normalizar escala ────────────────────────────────────────────────────
    const box = new Box3().setFromObject(clone);
    const size = box.getSize(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
      const scale = 2 / maxDim;
      clone.scale.setScalar(scale);
      const center = box.getCenter(new Vector3());
      clone.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
      console.log(
        `[3D] Tamaño original: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)} → escala: ${scale.toFixed(5)}`,
      );
    }

    // ── Aplicar overrides de materiales ──────────────────────────────────────
    const seenMaterials = new Set<string>();

    clone.traverse((obj) => {
      if (!(obj instanceof Mesh)) return;

      const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
      const fixed = mats.map((mat) => {
        if (!(mat instanceof MeshStandardMaterial)) return mat;

        const override = MATERIAL_OVERRIDES[mat.name];

        if (override) {
          const m = applyOverride(mat, override);
          if (!seenMaterials.has(mat.name)) {
            console.log(`[3D] Override aplicado: "${mat.name}"`, override);
            seenMaterials.add(mat.name);
          }
          return m;
        }

        console.log(`[3D] Override NO aplicado: "${mat.name}"`);

        // Fallback: fix genérico para exportaciones CAD con roughness=1
        if (mat.roughness >= 0.9 && mat.metalness >= 0.9) {
          const m = mat.clone();
          m.roughness = 0.3;
          m.needsUpdate = true;
          if (!seenMaterials.has(mat.name)) {
            console.log(`[3D] Fix genérico: "${mat.name}" roughness 1 → 0.3`);
            seenMaterials.add(mat.name);
          }
          return m;
        }

        return mat;
      });

      obj.material = Array.isArray(obj.material) ? fixed : fixed[0];
    });

    return clone;
  }, [scene]);

  useEffect(() => {
    for (const group of groups) {
      const selectedId = selections[group.name];
      console.group(`[3D] Grupo: "${group.name}" → selección: ${selectedId ?? "ninguna"}`);
      for (const option of group.options) {
        if (!option.glbObjectName) {
          console.log(`  ⚠ "${option.name}" sin glbObjectName, ignorado`);
          continue;
        }
        const obj = clonedScene.getObjectByName(option.glbObjectName);
        const isVisible = selectedId === option.componentId;
        if (obj) {
          obj.visible = isVisible;
          console.log(`  ${isVisible ? "✓ VISIBLE" : "✗ oculto "} "${option.glbObjectName}" (${option.name})`);
        } else {
          console.warn(`  ✗ NO ENCONTRADO en GLB: "${option.glbObjectName}" (${option.name})`);
        }
      }
      console.groupEnd();
    }
  }, [selections, groups, clonedScene]);

  return <primitive object={clonedScene} />;
}

function CanvasLoader() {
  const t = useTranslations("productDetail.configurator");
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 animate-spin rounded-full border-2 border-graphite border-t-racing-red" />
        <p className="text-xs text-silver">{t("loading")}</p>
      </div>
    </Html>
  );
}

export function ConfiguratorViewer({ modelUrl, groups, selections }: ConfiguratorViewerProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      shadows
      gl={{
        antialias: true,
        toneMapping: AgXToneMapping,
        toneMappingExposure: 1.0,
      }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.0} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} />

      <Suspense fallback={<CanvasLoader />}>
        <Bounds fit margin={1.4}>
          <Model url={modelUrl} groups={groups} selections={selections} />
        </Bounds>
        <Environment preset="studio" />
      </Suspense>

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={0.2}
        maxDistance={20}
      />
    </Canvas>
  );
}
