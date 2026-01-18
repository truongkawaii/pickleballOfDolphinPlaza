// Tournament Configuration Manager
class TournamentConfig {
  constructor() {
    this.config = this.loadConfig();
  }

  // Default configuration
  getDefaultConfig() {
    return {
      formatType: "multi-group", // 'multi-group' or 'simple'
      numGroups: 5, // 2, 4, 5, or 8 for multi-group; 1 for simple
      teamsPerGroup: 4, // 3-8
      version: 1,
    };
  }

  // Load configuration from localStorage
  loadConfig() {
    try {
      const saved = localStorage.getItem("tournamentConfig");
      if (saved) {
        const config = JSON.parse(saved);
        // Validate loaded config
        if (this.isValidConfig(config)) {
          return config;
        }
      }
    } catch (e) {
      console.error("Error loading config:", e);
    }
    return this.getDefaultConfig();
  }

  // Save configuration to localStorage
  saveConfig() {
    try {
      localStorage.setItem("tournamentConfig", JSON.stringify(this.config));
      return true;
    } catch (e) {
      console.error("Error saving config:", e);
      return false;
    }
  }

  // Validate configuration
  isValidConfig(config) {
    const validGroupsMulti = [2, 4, 5, 8];
    const minTeams = 3;
    const maxTeams = 8;

    if (!config || !config.formatType) return false;

    // Validate based on format type
    if (config.formatType === "simple") {
      return (
        config.numGroups === 1 &&
        config.teamsPerGroup >= minTeams &&
        config.teamsPerGroup <= maxTeams
      );
    } else if (config.formatType === "multi-group") {
      return (
        validGroupsMulti.includes(config.numGroups) &&
        config.teamsPerGroup >= minTeams &&
        config.teamsPerGroup <= maxTeams
      );
    }

    return false;
  }

  // Get current configuration
  getTournamentConfig() {
    return { ...this.config };
  }

  // Check if using simple format
  isSimpleFormat() {
    return this.config.formatType === "simple";
  }

  // Set tournament configuration
  setTournamentConfig(formatType, numGroups, teamsPerGroup) {
    const newConfig = {
      formatType: formatType || "multi-group",
      numGroups: parseInt(numGroups),
      teamsPerGroup: parseInt(teamsPerGroup),
      version: 1,
    };

    if (!this.isValidConfig(newConfig)) {
      throw new Error(
        "Invalid configuration. For multi-group: 2, 4, 5, or 8 groups. For simple: 1 group. Teams per group: 3-8.",
      );
    }

    this.config = newConfig;
    this.saveConfig();
    return true;
  }

  // Get total number of teams
  getTotalTeams() {
    return this.config.numGroups * this.config.teamsPerGroup;
  }

  // Get number of qualified teams (top 2 from each group)
  getQualifiedTeamsCount() {
    return this.config.numGroups * 2;
  }

  // Get group labels (A, B, C, D, etc.)
  getGroupLabels() {
    const labels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    if (this.isSimpleFormat()) {
      return ["A"]; // Simple format always uses single group
    }
    return labels.slice(0, this.config.numGroups);
  }

  // Determine knockout stages based on qualified teams
  getKnockoutStages() {
    // Simple format: only finals
    if (this.isSimpleFormat()) {
      return ["final"];
    }

    // Multi-group format: based on number of qualified teams
    const qualifiedCount = this.getQualifiedTeamsCount();

    switch (qualifiedCount) {
      case 4:
        return ["semifinal", "final"];
      case 8:
        return ["quarterfinal", "semifinal", "final"];
      case 10:
        return ["quarterfinal", "semifinal", "final"]; // 5 groups case
      case 16:
        return ["roundOf16", "quarterfinal", "semifinal", "final"];
      default:
        // Default to quarterfinal if unclear
        return ["quarterfinal", "semifinal", "final"];
    }
  }

  // Get knockout stage display names
  getStageDisplayName(stage) {
    const names = {
      roundOf16: "Vòng 1/16",
      quarterfinal: "Tứ kết",
      semifinal: "Bán kết",
      final: "Chung kết",
    };
    return names[stage] || stage;
  }

  // Get bracket subtitle (e.g., "Tứ kết → Bán kết → Chung kết")
  getBracketSubtitle() {
    if (this.isSimpleFormat()) {
      return "Vòng bảng → Chung kết (Top 2)";
    }
    const stages = this.getKnockoutStages();
    return stages.map((s) => this.getStageDisplayName(s)).join(" → ");
  }

  // Get total number of group stage matches
  getTotalGroupMatches() {
    const teamsPerGroup = this.config.teamsPerGroup;
    const matchesPerGroup = (teamsPerGroup * (teamsPerGroup - 1)) / 2;
    return matchesPerGroup * this.config.numGroups;
  }

  // Check if configuration can be changed (no teams added yet)
  canChangeConfig(currentTeams) {
    return currentTeams.length === 0;
  }

  // Reset to default configuration
  resetConfig() {
    this.config = this.getDefaultConfig();
    this.saveConfig();
  }
}

// Initialize global config
const tournamentConfig = new TournamentConfig();
