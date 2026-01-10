// Main Application State and Navigation
class TournamentApp {
  constructor() {
    this.currentView = "setup";
    this.currentGroup = "A";
    this.currentEditTeam = null;
    this.init();
  }

  // Helper function to get player names display
  getTeamDisplayName(team) {
    if (!team || !team.players || team.players.length < 2) {
      return team?.name || "???";
    }
    return `${team.players[0].name} / ${team.players[1].name}`;
  }

  init() {
    this.setupEventListeners();
    this.loadFromStorage();
    this.render();
  }

  setupEventListeners() {
    // Navigation tabs
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const view = e.currentTarget.dataset.view;
        this.switchView(view);
      });
    });

    // Group tabs
    document.querySelectorAll(".group-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        const group = e.currentTarget.dataset.group;
        this.switchGroup(group);
      });
    });

    // Team management
    document
      .getElementById("add-team-btn")
      ?.addEventListener("click", () => this.openTeamModal());
    document
      .getElementById("reset-teams-btn")
      ?.addEventListener("click", () => this.resetAllData());
    document
      .getElementById("save-team-btn")
      ?.addEventListener("click", () => this.saveTeam());

    // Modal close
    document.querySelectorAll(".modal-close").forEach((btn) => {
      btn.addEventListener("click", () => this.closeModal());
    });

    // Click outside modal to close
    document.getElementById("team-modal")?.addEventListener("click", (e) => {
      if (e.target.id === "team-modal") {
        this.closeModal();
      }
    });

    // Match entry
    document.getElementById("match-group")?.addEventListener("change", (e) => {
      this.updateMatchTeamOptions(e.target.value);
    });

    document.getElementById("save-match-btn")?.addEventListener("click", () => {
      tournament.saveGroupMatch();
    });

    // Knockout match entry
    document
      .getElementById("knockout-stage")
      ?.addEventListener("change", (e) => {
        this.updateKnockoutMatchOptions(e.target.value);
      });

    document
      .getElementById("knockout-match")
      ?.addEventListener("change", (e) => {
        this.loadExistingMatchScore(e.target.value);
      });

    document
      .getElementById("save-knockout-btn")
      ?.addEventListener("click", () => {
        tournament.saveKnockoutMatch();
      });

    // Export buttons
    document.getElementById("export-txt-btn")?.addEventListener("click", () => {
      exportManager.exportToTXT();
    });

    document.getElementById("export-pdf-btn")?.addEventListener("click", () => {
      exportManager.exportToPDF();
    });

    // Results export buttons
    document
      .getElementById("export-results-txt-btn")
      ?.addEventListener("click", () => {
        exportManager.exportResultsToTXT();
      });

    document
      .getElementById("export-results-pdf-btn")
      ?.addEventListener("click", () => {
        exportManager.exportResultsToPDF();
      });

    document
      .getElementById("reset-scores-btn")
      ?.addEventListener("click", () => this.resetScores());
  }

  switchView(view) {
    this.currentView = view;

    // Update nav tabs
    document.querySelectorAll(".nav-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.view === view);
    });

    // Update views
    document.querySelectorAll(".view").forEach((v) => {
      v.classList.toggle("active", v.id === `${view}-view`);
    });

    // Render content for the active view
    this.render();
  }

  switchGroup(group) {
    this.currentGroup = group;

    // Update group tabs
    document.querySelectorAll(".group-tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.group === group);
    });

    // Render group content
    this.renderGroupStandings();
  }

  openTeamModal(teamId = null) {
    const modal = document.getElementById("team-modal");
    const title = document.getElementById("modal-title");

    this.currentEditTeam = teamId;

    if (teamId) {
      title.textContent = "Chỉnh sửa đội";
      const team = tournament.teams.find((t) => t.id === teamId);
      if (team) {
        document.getElementById("team-name").value = team.name;
        document.getElementById("team-group").value = team.group;
        document.getElementById("player1-name").value =
          team.players[0]?.name || "";
        document.getElementById("player1-gender").value =
          team.players[0]?.gender || "M";
        document.getElementById("player2-name").value =
          team.players[1]?.name || "";
        document.getElementById("player2-gender").value =
          team.players[1]?.gender || "M";
      }
    } else {
      title.textContent = "Thêm đội mới";
      document.getElementById("team-name").value = "";
      document.getElementById("player1-name").value = "";
      document.getElementById("player2-name").value = "";
    }

    modal.classList.add("active");
  }

  closeModal() {
    document.getElementById("team-modal").classList.remove("active");
    this.currentEditTeam = null;
  }

  saveTeam() {
    const name = document.getElementById("team-name").value.trim();
    const group = document.getElementById("team-group").value;
    const player1Name = document.getElementById("player1-name").value.trim();
    const player1Gender = document.getElementById("player1-gender").value;
    const player2Name = document.getElementById("player2-name").value.trim();
    const player2Gender = document.getElementById("player2-gender").value;

    if (!name || !player1Name || !player2Name) {
      this.showMessage("Vui lòng điền đầy đủ thông tin!", "error");
      return;
    }

    // Check group limit (4 teams per group)
    const groupTeams = tournament.teams.filter(
      (t) => t.group === group && t.id !== this.currentEditTeam
    );
    if (groupTeams.length >= 4 && !this.currentEditTeam) {
      this.showMessage(`Bảng ${group} đã đủ 4 đội!`, "error");
      return;
    }

    const teamData = {
      name,
      group,
      players: [
        { name: player1Name, gender: player1Gender },
        { name: player2Name, gender: player2Gender },
      ],
    };

    if (this.currentEditTeam) {
      tournament.updateTeam(this.currentEditTeam, teamData);
      this.showMessage("Cập nhật đội thành công!", "success");
    } else {
      tournament.addTeam(teamData);
      this.showMessage("Thêm đội thành công!", "success");
    }

    this.closeModal();
    this.render();
  }

  updateMatchTeamOptions(group) {
    const team1Select = document.getElementById("match-team1");
    const team2Select = document.getElementById("match-team2");

    const teams = tournament.teams.filter((t) => t.group === group);

    const options = teams
      .map((t) => `<option value="${t.id}">${t.name}</option>`)
      .join("");

    team1Select.innerHTML = '<option value="">Đội 1</option>' + options;
    team2Select.innerHTML = '<option value="">Đội 2</option>' + options;
  }

  updateKnockoutMatchOptions(stage) {
    const matchSelect = document.getElementById("knockout-match");
    let options = "";

    if (stage === "quarterfinal") {
      options = `
                <option value="0">Tứ kết 1 (Hạng 1 vs Hạng 8)</option>
                <option value="1">Tứ kết 2 (Hạng 2 vs Hạng 7)</option>
                <option value="2">Tứ kết 3 (Hạng 3 vs Hạng 6)</option>
                <option value="3">Tứ kết 4 (Hạng 4 vs Hạng 5)</option>
            `;
    } else if (stage === "semifinal") {
      options = `
                <option value="0">Bán kết 1 (Thắng TK1 vs Thắng TK4)</option>
                <option value="1">Bán kết 2 (Thắng TK2 vs Thắng TK3)</option>
            `;
    } else if (stage === "final") {
      options = `<option value="0">Chung kết</option>`;
    }

    matchSelect.innerHTML = '<option value="">Chọn trận đấu</option>' + options;
  }

  loadExistingMatchScore(matchIndex) {
    const stage = document.getElementById("knockout-stage").value;
    const score1Input = document.getElementById("knockout-score1");
    const score2Input = document.getElementById("knockout-score2");

    if (!stage || matchIndex === "") {
      score1Input.value = "";
      score2Input.value = "";
      return;
    }

    const idx = parseInt(matchIndex);
    let matchData = null;

    if (stage === "quarterfinal") {
      matchData = tournament.matches.knockout.quarterfinals[idx];
    } else if (stage === "semifinal") {
      matchData = tournament.matches.knockout.semifinals[idx];
    } else if (stage === "final") {
      matchData = tournament.matches.knockout.final;
    }

    if (
      matchData &&
      matchData.score1 !== undefined &&
      matchData.score2 !== undefined
    ) {
      score1Input.value = matchData.score1;
      score2Input.value = matchData.score2;
    } else {
      score1Input.value = "";
      score2Input.value = "";
    }
  }

  render() {
    switch (this.currentView) {
      case "setup":
        this.renderTeamSetup();
        break;
      case "groups":
        this.renderGroupStandings();
        break;
      case "bracket":
        bracketManager.render();
        break;
      case "results":
        this.renderResults();
        break;
      case "export":
        exportManager.renderPreview();
        break;
    }
  }

  renderResults() {
    const content = document.getElementById("results-content");
    const groups = ["A", "B", "C", "D", "E"];

    let html = '<div class="results-summary">';

    groups.forEach((group) => {
      const groupMatches = tournament.matches.groupStage.filter(
        (m) => m.group === group
      );

      if (groupMatches.length > 0) {
        html += `
          <div class="results-group-section">
            <h3 class="results-group-title">
              <span class="group-badge">Bảng ${group}</span>
              <span class="match-count">${groupMatches.length} trận đấu</span>
            </h3>
            <div class="results-matches-list">
        `;

        groupMatches.forEach((match, idx) => {
          const team1 = tournament.teams.find((t) => t.id === match.team1);
          const team2 = tournament.teams.find((t) => t.id === match.team2);

          if (team1 && team2) {
            const winner = match.score1 > match.score2 ? team1.id : team2.id;

            html += `
              <div class="result-match-card">
                <div class="result-match-header">
                  <span class="result-match-number">Trận ${idx + 1}</span>
                  <span class="result-match-date">${new Date(
                    match.timestamp
                  ).toLocaleDateString("vi-VN")}</span>
                </div>
                <div class="result-match-body">
                  <div class="result-team ${
                    winner === team1.id ? "winner" : ""
                  }">
                    <div class="result-team-name">${team1.name}</div>
                    <div class="result-team-players">${this.getTeamDisplayName(
                      team1
                    )}</div>
                  </div>
                  <div class="result-score">
                    <span class="result-score-value ${
                      match.score1 > match.score2 ? "winning" : ""
                    }">${match.score1}</span>
                    <span class="result-score-separator">:</span>
                    <span class="result-score-value ${
                      match.score2 > match.score1 ? "winning" : ""
                    }">${match.score2}</span>
                  </div>
                  <div class="result-team ${
                    winner === team2.id ? "winner" : ""
                  }">
                    <div class="result-team-name">${team2.name}</div>
                    <div class="result-team-players">${this.getTeamDisplayName(
                      team2
                    )}</div>
                  </div>
                </div>
              </div>
            `;
          }
        });

        html += `
            </div>
          </div>
        `;
      }
    });

    // Check if no matches yet
    if (tournament.matches.groupStage.length === 0) {
      html += `
        <div class="no-results">
          <div class="no-results-icon">📊</div>
          <h3>Chưa có kết quả</h3>
          <p>Hãy nhập kết quả các trận đấu ở tab "Bảng xếp hạng"</p>
        </div>
      `;
    }

    html += "</div>";
    content.innerHTML = html;
  }

  renderTeamSetup() {
    const container = document.querySelector(".groups-container");
    const groups = ["A", "B", "C", "D", "E"];

    container.innerHTML = groups
      .map((group) => {
        const teams = tournament.teams.filter((t) => t.group === group);

        return `
                <div class="group-card">
                    <div class="group-header">
                        <div class="group-name">Bảng ${group}</div>
                        <div class="group-count">${teams.length}/4 đội</div>
                    </div>
                    <ul class="team-list">
                        ${
                          teams.length === 0
                            ? '<li style="color: var(--text-muted); text-align: center; padding: 2rem;">Chưa có đội</li>'
                            : ""
                        }
                        ${teams
                          .map(
                            (team) => `
                            <li class="team-item" onclick="app.openTeamModal('${
                              team.id
                            }')">
                                <div class="team-header">
                                    <div class="team-name">${team.name}</div>
                                    <div class="team-actions">
                                        <button class="btn-icon-only" onclick="event.stopPropagation(); app.openTeamModal('${
                                          team.id
                                        }')">✏️</button>
                                        <button class="btn-icon-only" onclick="event.stopPropagation(); tournament.deleteTeam('${
                                          team.id
                                        }'); app.render();">🗑️</button>
                                    </div>
                                </div>
                                <div class="team-players">
                                    ${team.players
                                      .map(
                                        (p) => `
                                        <div class="player">
                                            <span class="gender-badge ${
                                              p.gender === "M"
                                                ? "male"
                                                : "female"
                                            }">${
                                          p.gender === "M" ? "♂" : "♀"
                                        }</span>
                                            <span>${p.name}</span>
                                        </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </li>
                        `
                          )
                          .join("")}
                    </ul>
                </div>
            `;
      })
      .join("");
  }

  // Generate all round-robin fixtures for a group
  generateGroupFixtures(group) {
    const teams = tournament.teams.filter((t) => t.group === group);
    const fixtures = [];

    // Generate all unique pairings
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        fixtures.push({
          team1: teams[i],
          team2: teams[j],
        });
      }
    }

    return fixtures;
  }

  // Get match result if it exists
  getMatchResult(team1Id, team2Id) {
    return tournament.matches.groupStage.find(
      (m) =>
        (m.team1 === team1Id && m.team2 === team2Id) ||
        (m.team1 === team2Id && m.team2 === team1Id)
    );
  }

  renderGroupStandings() {
    const content = document.getElementById("group-content");

    if (this.currentGroup === "all") {
      // Render all qualified teams summary
      const qualified = tournament.getQualifiedTeams();
      content.innerHTML = `
                <div class="standings-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Hạng</th>
                                <th>Đội & Vận động viên</th>
                                <th>Bảng</th>
                                <th>Trận thắng</th>
                                <th>Hiệu số</th>
                                <th>Tổng ghi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${qualified
                              .map(
                                (team, idx) => `
                                <tr>
                                    <td><span class="rank-badge ${
                                      idx < 5
                                        ? "rank-qualified"
                                        : "rank-default"
                                    }">${idx + 1}</span></td>
                                    <td>
                                        <div style="font-weight: 700;">${
                                          team.name
                                        }</div>
                                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${this.getTeamDisplayName(
                                          team
                                        )}</div>
                                    </td>
                                    <td>Bảng ${team.group}</td>
                                    <td>${team.stats.wins}</td>
                                    <td class="${
                                      team.stats.pointDiff >= 0
                                        ? "stat-positive"
                                        : "stat-negative"
                                    }">${team.stats.pointDiff > 0 ? "+" : ""}${
                                  team.stats.pointDiff
                                }</td>
                                    <td>${team.stats.pointsFor}</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>
            `;
    } else {
      // Render specific group standings and fixtures
      const standings = tournament.getGroupStandings(this.currentGroup);
      const fixtures = this.generateGroupFixtures(this.currentGroup);

      content.innerHTML = `
                <div class="standings-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Hạng</th>
                                <th>Đội & Vận động viên</th>
                                <th>Trận</th>
                                <th>Thắng</th>
                                <th>Thua</th>
                                <th>Ghi</th>
                                <th>Thủng</th>
                                <th>Hiệu số</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${standings
                              .map(
                                (team, idx) => `
                                <tr>
                                    <td><span class="rank-badge ${
                                      idx === 0
                                        ? "rank-1"
                                        : idx === 1
                                        ? "rank-2"
                                        : "rank-default"
                                    }">${idx + 1}</span></td>
                                    <td>
                                        <div style="font-weight: 700;">${
                                          team.name
                                        }</div>
                                        <div style="font-size: 0.85rem; color: var(--text-secondary);">${this.getTeamDisplayName(
                                          team
                                        )}</div>
                                    </td>
                                    <td>${
                                      team.stats.wins + team.stats.losses
                                    }</td>
                                    <td>${team.stats.wins}</td>
                                    <td>${team.stats.losses}</td>
                                    <td>${team.stats.pointsFor}</td>
                                    <td>${team.stats.pointsAgainst}</td>
                                    <td class="${
                                      team.stats.pointDiff >= 0
                                        ? "stat-positive"
                                        : "stat-negative"
                                    }">${team.stats.pointDiff > 0 ? "+" : ""}${
                                  team.stats.pointDiff
                                }</td>
                                </tr>
                            `
                              )
                              .join("")}
                        </tbody>
                    </table>
                </div>

                ${
                  fixtures.length > 0
                    ? `
                <div class="fixtures-section">
                    <h3 class="fixtures-title">
                        <span class="fixtures-icon">📅</span>
                        Lịch thi đấu vòng bảng
                    </h3>
                    <div class="fixtures-grid">
                        ${fixtures
                          .map((fixture, idx) => {
                            const match = this.getMatchResult(
                              fixture.team1.id,
                              fixture.team2.id
                            );
                            const hasScore =
                              match &&
                              match.score1 !== undefined &&
                              match.score2 !== undefined;

                            // Determine the correct display order
                            let team1Display,
                              team2Display,
                              score1Display,
                              score2Display;
                            if (match) {
                              if (match.team1 === fixture.team1.id) {
                                team1Display = fixture.team1;
                                team2Display = fixture.team2;
                                score1Display = match.score1;
                                score2Display = match.score2;
                              } else {
                                team1Display = fixture.team2;
                                team2Display = fixture.team1;
                                score1Display = match.score2;
                                score2Display = match.score1;
                              }
                            } else {
                              team1Display = fixture.team1;
                              team2Display = fixture.team2;
                              score1Display = "-";
                              score2Display = "-";
                            }

                            return `
                              <div class="fixture-card ${
                                hasScore ? "has-score" : "no-score"
                              }" 
                                   onclick="app.openGroupMatchModal('${
                                     fixture.team1.id
                                   }', '${fixture.team2.id}', '${
                              this.currentGroup
                            }')">
                                <div class="fixture-match-number">Trận ${
                                  idx + 1
                                }</div>
                                <div class="fixture-teams">
                                  <div class="fixture-team">
                                    <div class="fixture-team-name">${
                                      team1Display.name
                                    }</div>
                                    <div class="fixture-players">${this.getTeamDisplayName(
                                      team1Display
                                    )}</div>
                                  </div>
                                  <div class="fixture-score">
                                    <div class="score-display ${
                                      hasScore ? "completed" : "pending"
                                    }">
                                      <span class="score-number">${score1Display}</span>
                                      <span class="score-separator">:</span>
                                      <span class="score-number">${score2Display}</span>
                                    </div>
                                  </div>
                                  <div class="fixture-team">
                                    <div class="fixture-team-name">${
                                      team2Display.name
                                    }</div>
                                    <div class="fixture-players">${this.getTeamDisplayName(
                                      team2Display
                                    )}</div>
                                  </div>
                                </div>
                                <div class="fixture-edit-hint">
                                  <span class="edit-icon">✏️</span>
                                  ${
                                    hasScore
                                      ? "Nhấn để sửa"
                                      : "Nhấn để nhập điểm"
                                  }
                                </div>
                              </div>
                            `;
                          })
                          .join("")}
                    </div>
                </div>
                `
                    : ""
                }
            `;
    }
  }

  // Open modal for group match score editing
  openGroupMatchModal(team1Id, team2Id, group) {
    const modal = document.getElementById("group-match-score-modal");
    const team1 = tournament.teams.find((t) => t.id === team1Id);
    const team2 = tournament.teams.find((t) => t.id === team2Id);

    if (!team1 || !team2) return;

    // Set hidden inputs
    document.getElementById("modal-group-match-team1").value = team1Id;
    document.getElementById("modal-group-match-team2").value = team2Id;
    document.getElementById("modal-group-match-group").value = group;

    // Set UI elements
    document.getElementById(
      "group-score-modal-title"
    ).textContent = `Cập nhật tỉ số - Bảng ${group}`;
    document.getElementById("modal-group-team1-name").textContent = team1.name;
    document.getElementById("modal-group-team1-players").textContent =
      this.getTeamDisplayName(team1);
    document.getElementById("modal-group-team2-name").textContent = team2.name;
    document.getElementById("modal-group-team2-players").textContent =
      this.getTeamDisplayName(team2);

    // Load existing scores if any
    const match = this.getMatchResult(team1Id, team2Id);
    if (match) {
      if (match.team1 === team1Id) {
        document.getElementById("modal-group-score1").value =
          match.score1 || "";
        document.getElementById("modal-group-score2").value =
          match.score2 || "";
      } else {
        document.getElementById("modal-group-score1").value =
          match.score2 || "";
        document.getElementById("modal-group-score2").value =
          match.score1 || "";
      }
    } else {
      document.getElementById("modal-group-score1").value = "";
      document.getElementById("modal-group-score2").value = "";
    }

    modal.classList.add("active");

    // Focus on first input
    setTimeout(() => {
      document.getElementById("modal-group-score1").focus();
    }, 100);
  }

  showMessage(text, type = "success") {
    const container = document.querySelector(".container");
    const message = document.createElement("div");
    message.className = `message message-${type}`;
    message.textContent = text;

    container.insertBefore(message, container.firstChild);

    setTimeout(() => {
      message.remove();
    }, 3000);
  }

  loadFromStorage() {
    const saved = localStorage.getItem("pickleball-tournament");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        tournament.teams = data.teams || [];
        tournament.matches = data.matches || {
          groupStage: [],
          knockout: { quarterfinals: [], semifinals: [], final: null },
        };
      } catch (e) {
        console.error("Error loading from storage:", e);
      }
    } else {
      // Load initial team data if no saved data exists
      if (typeof initialTeamsData !== "undefined") {
        tournament.teams = JSON.parse(JSON.stringify(initialTeamsData));
        this.saveToStorage();
      }
    }
  }

  saveToStorage() {
    const data = {
      teams: tournament.teams,
      matches: tournament.matches,
    };
    localStorage.setItem("pickleball-tournament", JSON.stringify(data));
  }

  resetAllData() {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác!"
      )
    ) {
      localStorage.removeItem("pickleball-tournament");
      tournament.teams = [];
      tournament.matches = {
        groupStage: [],
        knockout: { quarterfinals: [], semifinals: [], final: null },
      };
      this.render();
      this.showMessage("Đã xóa tất cả dữ liệu!", "success");
    }
  }

  resetScores() {
    if (
      confirm(
        "Bạn có chắc chắn muốn đặt lại tất cả điểm số? Các đội vẫn sẽ được giữ lại."
      )
    ) {
      tournament.resetMatches();
      this.saveToStorage();
      this.render();
      this.showMessage("Đã đặt lại tất cả điểm số!", "success");
    }
  }
  // Close group match score modal
  closeGroupMatchModal() {
    document
      .getElementById("group-match-score-modal")
      .classList.remove("active");
  }
}

// Match Modal Functions
function openMatchModal(
  stage,
  index,
  label,
  team1Name,
  team2Name,
  score1,
  score2
) {
  const modal = document.getElementById("match-score-modal");

  // Set hidden inputs
  document.getElementById("modal-match-stage").value = stage;
  document.getElementById("modal-match-index").value = index;

  // Set UI elements
  document.getElementById("score-modal-title").textContent = label;
  document.getElementById("modal-team1-name").textContent = team1Name;
  document.getElementById("modal-team2-name").textContent = team2Name;

  // Set scores (empty string becomes empty input)
  document.getElementById("modal-score1").value = score1 || "";
  document.getElementById("modal-score2").value = score2 || "";

  modal.classList.add("active");

  // Focus on first input
  setTimeout(() => {
    document.getElementById("modal-score1").focus();
  }, 100);
}

function closeMatchModal() {
  document.getElementById("match-score-modal").classList.remove("active");
}

// Initialize app when DOM is ready
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new TournamentApp();

  // Add event listener for match score modal save button
  const saveMatchScoreBtn = document.getElementById("save-match-score-btn");
  if (saveMatchScoreBtn) {
    saveMatchScoreBtn.addEventListener("click", () => {
      tournament.saveKnockoutMatchFromModal();
    });
  }

  // Add event listener for group match score modal save button
  const saveGroupMatchScoreBtn = document.getElementById(
    "save-group-match-score-btn"
  );
  if (saveGroupMatchScoreBtn) {
    saveGroupMatchScoreBtn.addEventListener("click", () => {
      tournament.saveGroupMatchFromModal();
    });
  }
});
