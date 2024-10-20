const getTypeString = (cell: number): string => {
  switch (cell) {
    case 10:
      return "drop";
    case 1:
      return "I_BLOCK";
    case 2:
      return "T_BLOCK";
    case 3:
      return "L_BLOCK";
    case 4:
      return "J_BLOCK";
    case 5:
      return "S_BLOCK";
    case 6:
      return "Z_BLOCK";
    case 7:
      return "O_BLOCK";
    case 11:
      return "I_BLOCK_FIX";
    case 12:
      return "T_BLOCK_FIX";
    case 13:
      return "L_BLOCK_FIX";
    case 14:
      return "J_BLOCK_FIX";
    case 15:
      return "S_BLOCK_FIX";
    case 16:
      return "Z_BLOCK_FIX";
    case 17:
      return "O_BLOCK_FIX";
    case 20:
      return "PENALTY";
  }
  return "ERROR";
};

export { getTypeString };
