const Model = require("../../app/models/base");

class TestModel extends Model {
    tableName() {
        return "test_table";
    }
}

describe("Base Model", () => {
    let model;

    beforeEach(() => {
        model = new TestModel();
    });

    describe("tableName", () => {
        it("should convert PascalCase to snake_case", () => {
            class MyTestModel extends Model {}
            const myModel = new MyTestModel();
            expect(myModel.tableName()).toBe("my_test_model");
        });

        it("should handle single word class names", () => {
            class Teams extends Model {}
            const teams = new Teams();
            expect(teams.tableName()).toBe("teams");
        });
    });

    describe("cache_ttl", () => {
        it("should return default TTL of 300 seconds", () => {
            expect(model.cache_ttl()).toBe(300);
        });

        it("should allow subclass to override TTL", () => {
            class CustomModel extends Model {
                cache_ttl() {
                    return 1800;
                }
            }
            const custom = new CustomModel();
            expect(custom.cache_ttl()).toBe(1800);
        });
    });

    describe("allowed_order_by", () => {
        it("should return empty array by default", () => {
            expect(model.allowed_order_by()).toEqual([]);
        });

        it("should allow subclass to define allowed values", () => {
            class CustomModel extends Model {
                allowed_order_by() {
                    return ["id", "name", "created_at DESC"];
                }
            }
            const custom = new CustomModel();
            expect(custom.allowed_order_by()).toEqual(["id", "name", "created_at DESC"]);
        });
    });

    describe("cache_key", () => {
        it("should generate unique key for different selectors", () => {
            const key1 = model.cache_key({ id: 1 }, { limit: 10 });
            const key2 = model.cache_key({ id: 2 }, { limit: 10 });

            expect(key1).not.toBe(key2);
        });

        it("should generate unique key for different options", () => {
            const key1 = model.cache_key({ id: 1 }, { limit: 10 });
            const key2 = model.cache_key({ id: 1 }, { limit: 20 });

            expect(key1).not.toBe(key2);
        });

        it("should generate same key for identical inputs", () => {
            const key1 = model.cache_key({ id: 1 }, { limit: 10 });
            const key2 = model.cache_key({ id: 1 }, { limit: 10 });

            expect(key1).toBe(key2);
        });

        it("should include table name in key", () => {
            const key = model.cache_key({ id: 1 }, {});
            expect(key).toContain("test_table");
        });
    });

    describe("orderBy validation", () => {
        it("should not throw error when orderBy is in allowlist", async () => {
            class SafeModel extends Model {
                tableName() {
                    return "seasons";
                }
                allowed_order_by() {
                    return ["id", "id DESC"];
                }
            }
            const safe = new SafeModel();

            await expect(safe.get({}, { orderBy: "id DESC", limit: 1 })).resolves.toBeDefined();
        });

        it("should throw error when orderBy is not in allowlist", async () => {
            class SafeModel extends Model {
                tableName() {
                    return "seasons";
                }
                allowed_order_by() {
                    return ["id", "id DESC"];
                }
            }
            const safe = new SafeModel();

            await expect(safe.get({}, { orderBy: "name", limit: 1 })).rejects.toThrow("Invalid orderBy value: name");
        });

        it("should allow any orderBy when allowlist is empty (no validation)", async () => {
            class UnsafeModel extends Model {
                tableName() {
                    return "seasons";
                }
                allowed_order_by() {
                    return [];
                }
            }
            const unsafe = new UnsafeModel();

            // Empty allowlist means no validation, so it will pass validation
            // but may still fail at SQL level with invalid column
            // This test just verifies validation is skipped
            try {
                await unsafe.get({}, { orderBy: "id", limit: 1 });
                expect(true).toBe(true); // Validation was skipped
            } catch (err) {
                // If it fails, it should be SQL error, not validation error
                expect(err.message).not.toContain("Invalid orderBy");
            }
        });
    });

    describe("isaObject validation", () => {
        it("should not throw error for valid object", () => {
            expect(() => {
                model.isaObject({ id: 1 });
            }).not.toThrow();
        });

        it("should throw error for non-object", () => {
            expect(() => {
                model.isaObject("not an object");
            }).toThrow();
        });
    });

    describe("isaString validation", () => {
        it("should not throw error for valid string", () => {
            expect(() => {
                model.isaString("SELECT * FROM table");
            }).not.toThrow();
        });

        it("should throw error for non-string", () => {
            expect(() => {
                model.isaString(123);
            }).toThrow();
        });
    });
});
