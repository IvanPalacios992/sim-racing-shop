import {
  checkPasswordRequirements,
  isPasswordValid,
  createLoginSchema,
  createRegisterSchema,
  createForgotPasswordSchema,
  createResetPasswordSchema,
} from "@/lib/validations/auth";

// Simple identity function as translation mock
const t = (key: string) => key;

describe("checkPasswordRequirements", () => {
  it("returns all false for empty string", () => {
    const result = checkPasswordRequirements("");
    expect(result.minLength).toBe(false);
    expect(result.hasUppercase).toBe(false);
    expect(result.hasLowercase).toBe(false);
    expect(result.hasNumber).toBe(false);
  });

  it("returns minLength true for 8+ chars", () => {
    const result = checkPasswordRequirements("abcdefgh");
    expect(result.minLength).toBe(true);
  });

  it("returns minLength false for less than 8 chars", () => {
    const result = checkPasswordRequirements("abcdefg");
    expect(result.minLength).toBe(false);
  });

  it("returns hasUppercase true when uppercase present", () => {
    const result = checkPasswordRequirements("A");
    expect(result.hasUppercase).toBe(true);
  });

  it("returns hasLowercase true when lowercase present", () => {
    const result = checkPasswordRequirements("a");
    expect(result.hasLowercase).toBe(true);
  });

  it("returns hasNumber true when digit present", () => {
    const result = checkPasswordRequirements("1");
    expect(result.hasNumber).toBe(true);
  });

  it("returns all true for 'Password1'", () => {
    const result = checkPasswordRequirements("Password1");
    expect(result.minLength).toBe(true);
    expect(result.hasUppercase).toBe(true);
    expect(result.hasLowercase).toBe(true);
    expect(result.hasNumber).toBe(true);
  });
});

describe("isPasswordValid", () => {
  it("returns false for empty string", () => {
    expect(isPasswordValid("")).toBe(false);
  });

  it("returns false for password missing uppercase", () => {
    expect(isPasswordValid("password1")).toBe(false);
  });

  it("returns false for password missing lowercase", () => {
    expect(isPasswordValid("PASSWORD1")).toBe(false);
  });

  it("returns false for password missing number", () => {
    expect(isPasswordValid("Password")).toBe(false);
  });

  it("returns false for short password", () => {
    expect(isPasswordValid("Pass1")).toBe(false);
  });

  it("returns true for valid password", () => {
    expect(isPasswordValid("Password1")).toBe(true);
  });
});

describe("createLoginSchema", () => {
  const schema = createLoginSchema(t);

  it("rejects empty email", () => {
    const result = schema.safeParse({ email: "", password: "pass" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = schema.safeParse({ email: "not-email", password: "pass" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = schema.safeParse({ email: "test@test.com", password: "" });
    expect(result.success).toBe(false);
  });

  it("accepts valid email and password", () => {
    const result = schema.safeParse({ email: "test@test.com", password: "pass" });
    expect(result.success).toBe(true);
  });

  it("rememberMe is optional", () => {
    const result = schema.safeParse({ email: "test@test.com", password: "pass" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rememberMe).toBeUndefined();
    }
  });
});

describe("createRegisterSchema", () => {
  const schema = createRegisterSchema(t);

  const validData = {
    email: "test@test.com",
    password: "Password1",
    confirmPassword: "Password1",
    acceptTerms: true,
  };

  it("rejects empty email", () => {
    const result = schema.safeParse({ ...validData, email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    const result = schema.safeParse({ ...validData, password: "Pass1", confirmPassword: "Pass1" });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = schema.safeParse({ ...validData, password: "password1", confirmPassword: "password1" });
    expect(result.success).toBe(false);
  });

  it("rejects password without lowercase", () => {
    const result = schema.safeParse({ ...validData, password: "PASSWORD1", confirmPassword: "PASSWORD1" });
    expect(result.success).toBe(false);
  });

  it("rejects password without number", () => {
    const result = schema.safeParse({ ...validData, password: "Password", confirmPassword: "Password" });
    expect(result.success).toBe(false);
  });

  it("rejects when confirmPassword does not match", () => {
    const result = schema.safeParse({ ...validData, confirmPassword: "Different1" });
    expect(result.success).toBe(false);
  });

  it("rejects when acceptTerms is false", () => {
    const result = schema.safeParse({ ...validData, acceptTerms: false });
    expect(result.success).toBe(false);
  });

  it("accepts valid registration data", () => {
    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("firstName and lastName are optional", () => {
    const result = schema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe("createForgotPasswordSchema", () => {
  const schema = createForgotPasswordSchema(t);

  it("rejects empty email", () => {
    const result = schema.safeParse({ email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = schema.safeParse({ email: "bad" });
    expect(result.success).toBe(false);
  });

  it("accepts valid email", () => {
    const result = schema.safeParse({ email: "test@test.com" });
    expect(result.success).toBe(true);
  });
});

describe("createResetPasswordSchema", () => {
  const schema = createResetPasswordSchema(t);

  it("rejects empty newPassword", () => {
    const result = schema.safeParse({ newPassword: "", confirmPassword: "" });
    expect(result.success).toBe(false);
  });

  it("rejects weak newPassword", () => {
    const result = schema.safeParse({ newPassword: "weak", confirmPassword: "weak" });
    expect(result.success).toBe(false);
  });

  it("rejects mismatched confirmPassword", () => {
    const result = schema.safeParse({ newPassword: "Password1", confirmPassword: "Password2" });
    expect(result.success).toBe(false);
  });

  it("accepts valid matching passwords", () => {
    const result = schema.safeParse({ newPassword: "Password1", confirmPassword: "Password1" });
    expect(result.success).toBe(true);
  });
});
