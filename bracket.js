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

    if (this.qualifiedTeams.length === 0) {
      container.innerHTML =
        '<p style="color: var(--text-muted); text-align: center; padding: 2rem;">Chưa có đội nào đủ điều kiện. Hoàn thành vòng bảng để xem kết quả.</p>';
      return;
    }

    container.innerHTML = this.qualifiedTeams
      .slice(0, 8)
      .map((team, idx) => {
        const label = idx < 5 ? "Nhất bảng" : "Nhì bảng (vé vớt)";
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

    if (this.qualifiedTeams.length < 8) {
      container.innerHTML = `
                <div style="text-align: center; padding: 4rem; color: var(--text-muted);">
                    <h3 style="margin-bottom: 1rem;">Chưa đủ đội để tạo sơ đồ đấu</h3>
                    <p>Cần 8 đội (5 nhất bảng + 3 nhì bảng) để bắt đầu vòng loại trực tiếp.</p>
                    <p>Hiện có: ${this.qualifiedTeams.length}/8 đội</p>
                </div>
            `;
      return;
    }

    const quarterfinals = this.getQuarterfinals();
    const semifinals = this.getSemifinals();
    const final = this.getFinal();

    container.innerHTML = `
            <div class="bracket">
                <!-- Quarterfinals -->
                <div class="bracket-round">
                    <div class="round-title">Tứ kết</div>
                    ${quarterfinals
                      .map((match, idx) =>
                        this.renderMatch(match, `QF${idx + 1}`)
                      )
                      .join("")}
                </div>

                <!-- Semifinals -->
                <div class="bracket-round">
                    <div class="round-title">Bán kết</div>
                    ${semifinals
                      .map((match, idx) =>
                        this.renderMatch(match, `SF${idx + 1}`)
                      )
                      .join("")}
                </div>

                <!-- Final -->
                <div class="bracket-round">
                    <div class="round-title">Chung kết</div>
                    ${this.renderMatch(final, "Final")}
                </div>

                <!-- Winner -->
                <div class="bracket-round">
                    <div class="round-title">🏆 Vô địch</div>
                    ${this.renderWinner()}
                </div>
            </div>
        `;
  }

  getQuarterfinals() {
    const qf = [];
    const matches = tournament.matches.knockout.quarterfinals;

    // QF1: Rank 1 vs Rank 8
    qf.push({
      team1: this.qualifiedTeams[0],
      team2: this.qualifiedTeams[7],
      matchData: matches[0],
      label: "TK1: Hạng 1 vs Hạng 8",
      stage: "quarterfinal",
      index: 0,
    });

    // QF2: Rank 2 vs Rank 7
    qf.push({
      team1: this.qualifiedTeams[1],
      team2: this.qualifiedTeams[6],
      matchData: matches[1],
      label: "TK2: Hạng 2 vs Hạng 7",
      stage: "quarterfinal",
      index: 1,
    });

    // QF3: Rank 3 vs Rank 6
    qf.push({
      team1: this.qualifiedTeams[2],
      team2: this.qualifiedTeams[5],
      matchData: matches[2],
      label: "TK3: Hạng 3 vs Hạng 6",
      stage: "quarterfinal",
      index: 2,
    });

    // QF4: Rank 4 vs Rank 5
    qf.push({
      team1: this.qualifiedTeams[3],
      team2: this.qualifiedTeams[4],
      matchData: matches[3],
      label: "TK4: Hạng 4 vs Hạng 5",
      stage: "quarterfinal",
      index: 3,
    });

    return qf;
  }

  getSemifinals() {
    const sf = [];
    const quarterfinals = this.getQuarterfinals();
    const matches = tournament.matches.knockout.semifinals;

    // SF1: Winner QF1 vs Winner QF4
    const qf1Winner = this.getMatchWinner(quarterfinals[0]);
    const qf4Winner = this.getMatchWinner(quarterfinals[3]);

    sf.push({
      team1: qf1Winner,
      team2: qf4Winner,
      matchData: matches[0],
      label: "BK1: Thắng TK1 vs Thắng TK4",
      stage: "semifinal",
      index: 0,
    });

    // SF2: Winner QF2 vs Winner QF3
    const qf2Winner = this.getMatchWinner(quarterfinals[1]);
    const qf3Winner = this.getMatchWinner(quarterfinals[2]);

    sf.push({
      team1: qf2Winner,
      team2: qf3Winner,
      matchData: matches[1],
      label: "BK2: Thắng TK2 vs Thắng TK3",
      stage: "semifinal",
      index: 1,
    });

    return sf;
  }

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
