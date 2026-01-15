// Bracket Visualization Manager
class BracketManager {
  constructor() {
    this.qualifiedTeams = [];
  }

  // Helper function to get player names display
  getTeamDisplayName(team) {
    if (!team || !team.players || team.players.length < 2) {
      return team?.name || "???";
    }
    return `${team.players[0].name} / ${team.players[1].name}`;
  }

  render() {
    this.qualifiedTeams = tournament.getQualifiedTeams();
    this.renderQualifiedTeams();
    this.renderBracket();
  }

  renderQualifiedTeams() {
    const container = document.getElementById("qualified-teams-list");
    const requiredTeams = tournamentConfig.getQualifiedTeamsCount();

    if (this.qualifiedTeams.length === 0) {
      container.innerHTML =
        '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Chưa có đội nào đủ điều kiện. Hoàn thành vòng bảng để xem kết quả.</p>';
      return;
    }

    container.innerHTML = this.qualifiedTeams
      .map((team, idx) => {
        // Determine if this team is 1st or 2nd from their group
        const groupStandings = tournament.getGroupStandings(team.group);
        const groupRank = groupStandings.findIndex((t) => t.id === team.id) + 1;
        const label = groupRank === 1 ? "Nhất bảng" : "Nhì bảng";

        return `
                <div class="qualified-team">
                    <div>
                        <strong>Hạng ${idx + 1}: ${this.getTeamDisplayName(
          team
        )}</strong>
                        <span style="color: var(--text-secondary); margin-left: 1rem;">(Bảng ${
                          team.group
                        } - ${label})</span>
                    </div>
                    <div style="color: var(--accent-solid);">
                        ${team.stats.wins} thắng | +${
          team.stats.pointDiff > 0 ? team.stats.pointDiff : "0"
        }
                    </div>
                </div>
            `;
      })
      .join("");
  }

  renderBracket() {
    const container = document.getElementById("bracket-container");
    const requiredTeams = tournamentConfig.getQualifiedTeamsCount();

    if (this.qualifiedTeams.length < requiredTeams) {
      container.innerHTML = `
                <div style="text-align: center; padding: 4rem; color: var(--text-muted);">
                    <h3 style="margin-bottom: 1rem;">Chưa đủ đội để tạo sơ đồ đấu</h3>
                    <p>Cần ${requiredTeams} đội (top 2 từ mỗi bảng) để bắt đầu vòng loại trực tiếp.</p>
                    <p>Hiện có: ${this.qualifiedTeams.length}/${requiredTeams} đội</p>
                </div>
            `;
      return;
    }

    const stages = tournamentConfig.getKnockoutStages();
    let rounds = [];

    // Build rounds based on stages
    if (stages.includes("roundOf16")) {
      rounds.push({
        title: "Vòng 1/16",
        matches: this.getRoundOf16(),
      });
    }

    if (stages.includes("quarterfinal")) {
      rounds.push({
        title: "Tứ kết",
        matches: this.getQuarterfinals(),
      });
    }

    if (stages.includes("semifinal")) {
      rounds.push({
        title: "Bán kết",
        matches: this.getSemifinals(),
      });
    }

    if (stages.includes("final")) {
      rounds.push({
        title: "Chung kết",
        matches: [this.getFinal()],
      });
    }

    // Render all rounds
    let bracketHTML = '<div class="bracket">';

    rounds.forEach((round) => {
      bracketHTML += `
                <div class="bracket-round">
                    <div class="round-title">${round.title}</div>
                    ${round.matches
                      .map((match, idx) =>
                        this.renderMatch(match, `${round.title}_${idx + 1}`)
                      )
                      .join("")}
                </div>
            `;
    });

    // Winner
    bracketHTML += `
            <div class="bracket-round">
                <div class="round-title">🏆 Vô địch</div>
                ${this.renderWinner()}
            </div>
        </div>`;

    container.innerHTML = bracketHTML;
  }

  // Get Round of 16 matches (16 teams)
  getRoundOf16() {
    const r16 = [];
    const matches = tournament.matches.knockout.roundOf16 || [];

    // Standard seeding for 16 teams: 1v16, 2v15, 3v14, 4v13, 5v12, 6v11, 7v10, 8v9
    const matchups = [
      [0, 15],
      [1, 14],
      [2, 13],
      [3, 12],
      [4, 11],
      [5, 10],
      [6, 9],
      [7, 8],
    ];

    matchups.forEach(([idx1, idx2], matchIdx) => {
      r16.push({
        team1: this.qualifiedTeams[idx1],
        team2: this.qualifiedTeams[idx2],
        matchData: matches[matchIdx],
        label: `1/16 ${matchIdx + 1}: Hạng ${idx1 + 1} vs Hạng ${idx2 + 1}`,
        stage: "roundOf16",
        index: matchIdx,
      });
    });

    return r16;
  }

  // Get Quarterfinal matches (8 or 16 teams)
  getQuarterfinals() {
    const qf = [];
    const matches = tournament.matches.knockout.quarterfinals || [];
    const stages = tournamentConfig.getKnockoutStages();

    if (stages.includes("roundOf16")) {
      // Quarterfinals come from Round of 16 winners
      const r16Matches = this.getRoundOf16();

      for (let i = 0; i < 4; i++) {
        const match1 = r16Matches[i * 2];
        const match2 = r16Matches[i * 2 + 1];

        qf.push({
          team1: this.getMatchWinner(match1),
          team2: this.getMatchWinner(match2),
          matchData: matches[i],
          label: `TK${i + 1}: Thắng 1/16 ${i * 2 + 1} vs Thắng 1/16 ${
            i * 2 + 2
          }`,
          stage: "quarterfinal",
          index: i,
        });
      }
    } else {
      // Quarterfinals with 8 teams (standard seeding: 1v8, 2v7, 3v6, 4v5)
      const matchups = [
        [0, 7],
        [1, 6],
        [2, 5],
        [3, 4],
      ];

      matchups.forEach(([idx1, idx2], matchIdx) => {
        qf.push({
          team1: this.qualifiedTeams[idx1],
          team2: this.qualifiedTeams[idx2],
          matchData: matches[matchIdx],
          label: `TK${matchIdx + 1}: Hạng ${idx1 + 1} vs Hạng ${idx2 + 1}`,
          stage: "quarterfinal",
          index: matchIdx,
        });
      });
    }

    return qf;
  }

  // Get Semifinal matches
  getSemifinals() {
    const sf = [];
    const matches = tournament.matches.knockout.semifinals || [];
    const stages = tournamentConfig.getKnockoutStages();

    if (stages.includes("quarterfinal")) {
      // Semifinals from quarterfinal winners
      const qfMatches = this.getQuarterfinals();

      sf.push({
        team1: this.getMatchWinner(qfMatches[0]),
        team2: this.getMatchWinner(qfMatches[3]),
        matchData: matches[0],
        label: "BK1: Thắng TK1 vs Thắng TK4",
        stage: "semifinal",
        index: 0,
      });

      sf.push({
        team1: this.getMatchWinner(qfMatches[1]),
        team2: this.getMatchWinner(qfMatches[2]),
        matchData: matches[1],
        label: "BK2: Thắng TK2 vs Thắng TK3",
        stage: "semifinal",
        index: 1,
      });
    } else {
      // Semifinals with 4 teams (1v4, 2v3)
      sf.push({
        team1: this.qualifiedTeams[0],
        team2: this.qualifiedTeams[3],
        matchData: matches[0],
        label: "BK1: Hạng 1 vs Hạng 4",
        stage: "semifinal",
        index: 0,
      });

      sf.push({
        team1: this.qualifiedTeams[1],
        team2: this.qualifiedTeams[2],
        matchData: matches[1],
        label: "BK2: Hạng 2 vs Hạng 3",
        stage: "semifinal",
        index: 1,
      });
    }

    return sf;
  }

  // Get Final match
  getFinal() {
    const semifinals = this.getSemifinals();
    const sf1Winner = this.getMatchWinner(semifinals[0]);
    const sf2Winner = this.getMatchWinner(semifinals[1]);

    return {
      team1: sf1Winner,
      team2: sf2Winner,
      matchData: tournament.matches.knockout.final,
      label: "Chung kết",
      stage: "final",
      index: 0,
    };
  }

  getMatchWinner(match) {
    if (!match.matchData || !match.matchData.winner) {
      return { name: "???", group: "?" };
    }

    return match.matchData.winner === "team1" ? match.team1 : match.team2;
  }

  renderMatch(match, id) {
    const team1 = match.team1 || { name: "???", group: "?" };
    const team2 = match.team2 || { name: "???", group: "?" };
    const matchData = match.matchData || {};

    const score1 = matchData.score1 !== undefined ? matchData.score1 : "-";
    const score2 = matchData.score2 !== undefined ? matchData.score2 : "-";

    const team1Winner = matchData.winner === "team1";
    const team2Winner = matchData.winner === "team2";

    // Check if both teams are known (not ???)
    const isClickable = team1.name !== "???" && team2.name !== "???";

    // Prepare team names for display (use full names with players)
    const team1Display = this.getTeamDisplayName(team1);
    const team2Display = this.getTeamDisplayName(team2);

    // Prepare onclick handler with all necessary data
    const onclickAttr = isClickable
      ? `onclick="openMatchModal('${match.stage}', ${match.index}, '${
          match.label
        }', '${team1Display.replace(/'/g, "\\'")}', '${team2Display.replace(
          /'/g,
          "\\'"
        )}', '${matchData.score1 || ""}', '${matchData.score2 || ""}')"`
      : "";

    return `
            <div class="bracket-match ${
              isClickable ? "clickable" : ""
            }" data-match="${id}" ${onclickAttr}>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; text-align: center;">
                    ${match.label}
                </div>
                <div class="bracket-team ${team1Winner ? "winner" : ""}">
                    <span class="bracket-team-name">${team1Display}</span>
                    <span class="bracket-score">${score1}</span>
                </div>
                <div class="bracket-team ${team2Winner ? "winner" : ""}">
                    <span class="bracket-team-name">${team2Display}</span>
                    <span class="bracket-score">${score2}</span>
                </div>
            </div>
        `;
  }

  renderWinner() {
    const final = this.getFinal();
    const winner = this.getMatchWinner(final);

    if (winner.name === "???") {
      return `
                <div class="bracket-match" style="background: var(--bg-card); text-align: center; padding: 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🏆</div>
                    <div style="font-size: 1.2rem; color: var(--text-muted);">Chưa có</div>
                </div>
            `;
    }

    return `
            <div class="bracket-match" style="background: linear-gradient(135deg, #FFD700, #FFA500); color: #000; text-align: center; padding: 2rem; border: none;">
                <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
                <div style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">${this.getTeamDisplayName(
                  winner
                )}</div>
                <div style="font-size: 0.9rem; opacity: 0.8;">Vô địch giải đấu</div>
            </div>
        `;
  }
}

const bracketManager = new BracketManager();
