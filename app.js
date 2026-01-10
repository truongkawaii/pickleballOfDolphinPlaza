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
      case "export":
        exportManager.renderPreview();
        break;
    }
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
      // Render specific group standings
      const standings = tournament.getGroupStandings(this.currentGroup);
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
            `;
    }
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
}

// Initialize app when DOM is ready
let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new TournamentApp();
});
