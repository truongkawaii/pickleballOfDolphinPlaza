// Tournament Management Logic
class TournamentManager {
  constructor() {
    this.teams = [];
    this.matches = {
      groupStage: [],
      knockout: {
        quarterfinals: [],
        semifinals: [],
        final: null,
      },
    };
  }

  // Team Management
  addTeam(teamData) {
    const team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: teamData.name,
      group: teamData.group,
      players: teamData.players,
      stats: {
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
      },
    };
    this.teams.push(team);
    this.saveData();
    return team;
  }

  updateTeam(teamId, teamData) {
    const teamIndex = this.teams.findIndex((t) => t.id === teamId);
    if (teamIndex !== -1) {
      this.teams[teamIndex] = {
        ...this.teams[teamIndex],
        name: teamData.name,
        group: teamData.group,
        players: teamData.players,
      };
      this.saveData();
    }
  }

  deleteTeam(teamId) {
    this.teams = this.teams.filter((t) => t.id !== teamId);
    // Also remove related matches
    this.matches.groupStage = this.matches.groupStage.filter(
      (m) => m.team1 !== teamId && m.team2 !== teamId
    );
    this.saveData();
  }

  resetMatches() {
    this.matches = {
      groupStage: [],
      knockout: {
        quarterfinals: [],
        semifinals: [],
        final: null,
      },
    };
    this.updateTeamStats();
  }

  // Group Stage Match Management
  saveGroupMatch() {
    const group = document.getElementById("match-group").value;
    const team1Id = document.getElementById("match-team1").value;
    const team2Id = document.getElementById("match-team2").value;
    const score1 = parseInt(document.getElementById("match-score1").value);
    const score2 = parseInt(document.getElementById("match-score2").value);

    if (!group || !team1Id || !team2Id || isNaN(score1) || isNaN(score2)) {
      app.showMessage("Vui lòng điền đầy đủ thông tin trận đấu!", "error");
      return;
    }

    if (team1Id === team2Id) {
      app.showMessage("Không thể chọn cùng một đội!", "error");
      return;
    }

    // Check if match already exists
    const existingMatchIndex = this.matches.groupStage.findIndex(
      (m) =>
        m.group === group &&
        ((m.team1 === team1Id && m.team2 === team2Id) ||
          (m.team1 === team2Id && m.team2 === team1Id))
    );

    const matchData = {
      group,
      team1: team1Id,
      team2: team2Id,
      score1,
      score2,
      timestamp: Date.now(),
    };

    if (existingMatchIndex !== -1) {
      this.matches.groupStage[existingMatchIndex] = matchData;
    } else {
      this.matches.groupStage.push(matchData);
    }

    this.updateTeamStats();
    this.saveData();

    // Clear form
    document.getElementById("match-score1").value = "";
    document.getElementById("match-score2").value = "";

    app.showMessage("Đã lưu kết quả trận đấu!", "success");
    app.renderGroupStandings();
  }

  // Update team statistics based on matches
  updateTeamStats() {
    // Reset all stats
    this.teams.forEach((team) => {
      team.stats = {
        wins: 0,
        losses: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        pointDiff: 0,
      };
    });

    // Calculate stats from group stage matches
    this.matches.groupStage.forEach((match) => {
      const team1 = this.teams.find((t) => t.id === match.team1);
      const team2 = this.teams.find((t) => t.id === match.team2);

      if (!team1 || !team2) return;

      // Update points
      team1.stats.pointsFor += match.score1;
      team1.stats.pointsAgainst += match.score2;
      team2.stats.pointsFor += match.score2;
      team2.stats.pointsAgainst += match.score1;

      // Update wins/losses
      if (match.score1 > match.score2) {
        team1.stats.wins++;
        team2.stats.losses++;
      } else {
        team2.stats.wins++;
        team1.stats.losses++;
      }

      // Calculate point difference
      team1.stats.pointDiff = team1.stats.pointsFor - team1.stats.pointsAgainst;
      team2.stats.pointDiff = team2.stats.pointsFor - team2.stats.pointsAgainst;
    });
  }

  // Save group match from modal
  saveGroupMatchFromModal() {
    const team1Id = document.getElementById("modal-group-match-team1").value;
    const team2Id = document.getElementById("modal-group-match-team2").value;
    const group = document.getElementById("modal-group-match-group").value;
    const score1 = parseInt(
      document.getElementById("modal-group-score1").value
    );
    const score2 = parseInt(
      document.getElementById("modal-group-score2").value
    );

    if (!team1Id || !team2Id || !group || isNaN(score1) || isNaN(score2)) {
      app.showMessage("Vui lòng điền đầy đủ điểm số!", "error");
      return;
    }

    // Check if match already exists
    const existingMatchIndex = this.matches.groupStage.findIndex(
      (m) =>
        m.group === group &&
        ((m.team1 === team1Id && m.team2 === team2Id) ||
          (m.team1 === team2Id && m.team2 === team1Id))
    );

    const matchData = {
      group,
      team1: team1Id,
      team2: team2Id,
      score1,
      score2,
      timestamp: Date.now(),
    };

    if (existingMatchIndex !== -1) {
      this.matches.groupStage[existingMatchIndex] = matchData;
    } else {
      this.matches.groupStage.push(matchData);
    }

    this.updateTeamStats();
    this.saveData();

    // Close modal
    app.closeGroupMatchModal();

    app.showMessage("Đã lưu kết quả trận đấu!", "success");
    app.renderGroupStandings();
  }

  // Get group standings with proper ranking
  getGroupStandings(group) {
    const groupTeams = this.teams.filter((t) => t.group === group);
    return this.rankTeams(groupTeams);
  }

  // Ranking algorithm based on criteria
  rankTeams(teams) {
    return teams.sort((a, b) => {
      // 1. Number of wins
      if (a.stats.wins !== b.stats.wins) {
        return b.stats.wins - a.stats.wins;
      }

      // 2. Point difference (most important tiebreaker)
      if (a.stats.pointDiff !== b.stats.pointDiff) {
        return b.stats.pointDiff - a.stats.pointDiff;
      }

      // 3. Head-to-head (if they played each other)
      const h2h = this.getHeadToHead(a.id, b.id);
      if (h2h !== 0) {
        return h2h;
      }

      // 4. Total points scored
      return b.stats.pointsFor - a.stats.pointsFor;
    });
  }

  // Get head-to-head result between two teams
  getHeadToHead(team1Id, team2Id) {
    const match = this.matches.groupStage.find(
      (m) =>
        (m.team1 === team1Id && m.team2 === team2Id) ||
        (m.team1 === team2Id && m.team2 === team1Id)
    );

    if (!match) return 0;

    if (match.team1 === team1Id) {
      return match.score1 > match.score2 ? -1 : 1;
    } else {
      return match.score2 > match.score1 ? -1 : 1;
    }
  }

  // Get qualified teams for knockout stage
  getQualifiedTeams() {
    const groups = ["A", "B", "C", "D", "E"];
    const groupWinners = [];
    const runnersUp = [];

    // Get first and second place from each group
    groups.forEach((group) => {
      const standings = this.getGroupStandings(group);
      if (standings.length > 0) {
        groupWinners.push(standings[0]);
        if (standings.length > 1) {
          runnersUp.push(standings[1]);
        }
      }
    });

    // Sort runners-up by ranking criteria
    const sortedRunnersUp = this.rankTeams(runnersUp);

    // Get top 3 runners-up
    const bestRunnersUp = sortedRunnersUp.slice(0, 3);

    // Combine and sort all qualified teams
    const allQualified = [...groupWinners, ...bestRunnersUp];
    return this.rankTeams(allQualified);
  }

  // Knockout Stage Management
  saveKnockoutMatch() {
    const stage = document.getElementById("knockout-stage").value;
    const matchIndex = parseInt(
      document.getElementById("knockout-match").value
    );
    const score1 = parseInt(document.getElementById("knockout-score1").value);
    const score2 = parseInt(document.getElementById("knockout-score2").value);

    if (!stage || isNaN(matchIndex) || isNaN(score1) || isNaN(score2)) {
      app.showMessage("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    // Validate score based on stage
    const isValid = this.validateKnockoutScore(stage, score1, score2);
    if (!isValid) {
      return;
    }

    const matchData = {
      score1,
      score2,
      winner: score1 > score2 ? "team1" : "team2",
      timestamp: Date.now(),
    };

    if (stage === "quarterfinal") {
      if (!this.matches.knockout.quarterfinals[matchIndex]) {
        this.matches.knockout.quarterfinals[matchIndex] = {};
      }
      this.matches.knockout.quarterfinals[matchIndex] = {
        ...this.matches.knockout.quarterfinals[matchIndex],
        ...matchData,
      };
    } else if (stage === "semifinal") {
      if (!this.matches.knockout.semifinals[matchIndex]) {
        this.matches.knockout.semifinals[matchIndex] = {};
      }
      this.matches.knockout.semifinals[matchIndex] = {
        ...this.matches.knockout.semifinals[matchIndex],
        ...matchData,
      };
    } else if (stage === "final") {
      this.matches.knockout.final = {
        ...this.matches.knockout.final,
        ...matchData,
      };
    }

    this.saveData();

    // Clear form
    document.getElementById("knockout-score1").value = "";
    document.getElementById("knockout-score2").value = "";

    app.showMessage("Đã lưu kết quả!", "success");
    bracketManager.render();
  }

  saveKnockoutMatchFromModal() {
    const stage = document.getElementById("modal-match-stage").value;
    const matchIndex = parseInt(
      document.getElementById("modal-match-index").value
    );
    const score1 = parseInt(document.getElementById("modal-score1").value);
    const score2 = parseInt(document.getElementById("modal-score2").value);

    if (!stage || isNaN(matchIndex) || isNaN(score1) || isNaN(score2)) {
      app.showMessage("Vui lòng điền đầy đủ điểm số!", "error");
      return;
    }

    // Validate score based on stage
    const isValid = this.validateKnockoutScore(stage, score1, score2);
    if (!isValid) {
      return;
    }

    const matchData = {
      score1,
      score2,
      winner: score1 > score2 ? "team1" : "team2",
      timestamp: Date.now(),
    };

    if (stage === "quarterfinal") {
      if (!this.matches.knockout.quarterfinals[matchIndex]) {
        this.matches.knockout.quarterfinals[matchIndex] = {};
      }
      this.matches.knockout.quarterfinals[matchIndex] = {
        ...this.matches.knockout.quarterfinals[matchIndex],
        ...matchData,
      };
    } else if (stage === "semifinal") {
      if (!this.matches.knockout.semifinals[matchIndex]) {
        this.matches.knockout.semifinals[matchIndex] = {};
      }
      this.matches.knockout.semifinals[matchIndex] = {
        ...this.matches.knockout.semifinals[matchIndex],
        ...matchData,
      };
    } else if (stage === "final") {
      this.matches.knockout.final = {
        ...this.matches.knockout.final,
        ...matchData,
      };
    }

    this.saveData();

    // Close modal
    closeMatchModal();

    app.showMessage("Đã lưu kết quả!", "success");
    bracketManager.render();
  }

  validateKnockoutScore(stage, score1, score2) {
    const diff = Math.abs(score1 - score2);

    if (stage === "quarterfinal") {
      // First to 11, no win-by-2
      if (
        Math.max(score1, score2) < 11 ||
        (Math.max(score1, score2) === 11 && diff === 0)
      ) {
        app.showMessage("Tứ kết: chạm 11 điểm, không cần cách 2!", "error");
        return false;
      }
    } else if (stage === "semifinal") {
      // Win by 2, but cap at 13
      const maxScore = Math.max(score1, score2);
      if (maxScore < 11) {
        app.showMessage("Bán kết: tối thiểu 11 điểm!", "error");
        return false;
      }
      if (maxScore < 13 && diff < 2) {
        app.showMessage("Bán kết: cần cách 2 điểm (hoặc chạm 13)!", "error");
        return false;
      }
      if (maxScore > 13) {
        app.showMessage("Bán kết: tối đa 13 điểm!", "error");
        return false;
      }
    } else if (stage === "final") {
      // Win by 2, but cap at 15
      const maxScore = Math.max(score1, score2);
      if (maxScore < 11) {
        app.showMessage("Chung kết: tối thiểu 11 điểm!", "error");
        return false;
      }
      if (maxScore < 15 && diff < 2) {
        app.showMessage("Chung kết: cần cách 2 điểm (hoặc chạm 15)!", "error");
        return false;
      }
      if (maxScore > 15) {
        app.showMessage("Chung kết: tối đa 15 điểm!", "error");
        return false;
      }
    }

    return true;
  }

  saveData() {
    app.saveToStorage();
  }
}

// Initialize tournament manager
const tournament = new TournamentManager();
