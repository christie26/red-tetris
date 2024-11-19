import { getTypeString } from "../components/functions";

describe("getTypeString function", () => {
  it("should return 'drop' when cell is 10", () => {
    expect(getTypeString(10)).toBe("drop");
  });

  it("should return 'I_BLOCK' when cell is 1", () => {
    expect(getTypeString(1)).toBe("I_BLOCK");
  });

  it("should return 'T_BLOCK' when cell is 2", () => {
    expect(getTypeString(2)).toBe("T_BLOCK");
  });

  it("should return 'L_BLOCK' when cell is 3", () => {
    expect(getTypeString(3)).toBe("L_BLOCK");
  });

  it("should return 'J_BLOCK' when cell is 4", () => {
    expect(getTypeString(4)).toBe("J_BLOCK");
  });

  it("should return 'S_BLOCK' when cell is 5", () => {
    expect(getTypeString(5)).toBe("S_BLOCK");
  });

  it("should return 'Z_BLOCK' when cell is 6", () => {
    expect(getTypeString(6)).toBe("Z_BLOCK");
  });

  it("should return 'O_BLOCK' when cell is 7", () => {
    expect(getTypeString(7)).toBe("O_BLOCK");
  });

  it("should return 'I_BLOCK_FIX' when cell is 11", () => {
    expect(getTypeString(11)).toBe("I_BLOCK_FIX");
  });

  it("should return 'T_BLOCK_FIX' when cell is 12", () => {
    expect(getTypeString(12)).toBe("T_BLOCK_FIX");
  });

  it("should return 'L_BLOCK_FIX' when cell is 13", () => {
    expect(getTypeString(13)).toBe("L_BLOCK_FIX");
  });

  it("should return 'J_BLOCK_FIX' when cell is 14", () => {
    expect(getTypeString(14)).toBe("J_BLOCK_FIX");
  });

  it("should return 'S_BLOCK_FIX' when cell is 15", () => {
    expect(getTypeString(15)).toBe("S_BLOCK_FIX");
  });

  it("should return 'Z_BLOCK_FIX' when cell is 16", () => {
    expect(getTypeString(16)).toBe("Z_BLOCK_FIX");
  });

  it("should return 'O_BLOCK_FIX' when cell is 17", () => {
    expect(getTypeString(17)).toBe("O_BLOCK_FIX");
  });

  it("should return 'PENALTY' when cell is 20", () => {
    expect(getTypeString(20)).toBe("PENALTY");
  });

  it("should return an empty string for unknown cell values", () => {
    expect(getTypeString(0)).toBe("");
    expect(getTypeString(999)).toBe("");
    expect(getTypeString(-1)).toBe("");
  });
});
