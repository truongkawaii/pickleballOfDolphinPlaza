// Export Manager
class ExportManager {
  constructor() {}

  renderPreview() {
    const content = this.generateTextContent();
    document.getElementById("export-preview-content").textContent = content;
  }

  generateTextContent() {
    let content = "";

    // Header
    content += "═══════════════════════════════════════════════════════\n";
    content += "     DOLPHIN PLAZA PICKLEBALL TOURNAMENT 2026\n";
    content += "═══════════════════════════════════════════════════════\n\n";

    // Tournament Info
    content += "📊 THÔNG TIN GIẢI ĐẤU\n";
    content += "───────────────────────────────────────────────────────\n";
    content += `Số đội tham gia: ${tournament.teams.length}/20\n`;
    content += `Số trận vòng bảng: ${tournament.matches.groupStage.length}\n\n`;

    // Group Stage Results
    content += "🎾 KẾT QUẢ VÒNG BẢNG\n";
    content += "═══════════════════════════════════════════════════════\n\n";

    const groups = ["A", "B", "C", "D", "E"];
    groups.forEach((group) => {
      const standings = tournament.getGroupStandings(group);
      if (standings.length === 0) return;

      content += `┌─ BẢNG ${group} ─────────────────────────────────────────┐\n`;
      content += `│ Hạng │ Đội                    │ T │ Th│ Ghi│HS  │\n`;
      content += `├──────┼────────────────────────┼───┼───┼────┼────┤\n`;

      standings.forEach((team, idx) => {
        const rank = (idx + 1).toString().padEnd(5);
        const name = team.name.padEnd(23).substring(0, 23);
        const matches = (team.stats.wins + team.stats.losses)
          .toString()
          .padEnd(3);
        const wins = team.stats.wins.toString().padEnd(3);
        const pointsFor = team.stats.pointsFor.toString().padEnd(4);
        const diff = (
          team.stats.pointDiff >= 0
            ? "+" + team.stats.pointDiff
            : team.stats.pointDiff
        )
          .toString()
          .padEnd(4);

        content += `│ ${rank}│ ${name}│ ${matches}│ ${wins}│ ${pointsFor}│ ${diff}│\n`;
      });

      content += `└──────────────────────────────────────────────────────┘\n\n`;
    });

    // Qualified Teams
    const qualified = tournament.getQualifiedTeams();
    if (qualified.length >= 8) {
      content += "🏆 ĐỘI VÀO VÒNG TRONG (8 đội)\n";
      content += "═══════════════════════════════════════════════════════\n";

      qualified.slice(0, 8).forEach((team, idx) => {
        const label = idx < 5 ? "Nhất bảng" : "Nhì bảng (vé vớt)";
        content += `${idx + 1}. ${team.name} (Bảng ${
          team.group
        } - ${label}) - ${team.stats.wins} thắng, +${team.stats.pointDiff}\n`;
      });
      content += "\n";

      // Knockout Results
      content += "🎯 KẾT QUẢ VÒNG LOẠI TRỰC TIẾP\n";
      content += "═══════════════════════════════════════════════════════\n\n";

      // Quarterfinals
      content += "▸ TỨ KẾT\n";
      content += "───────────────────────────────────────────────────────\n";
      const quarterfinals = bracketManager.getQuarterfinals();
      quarterfinals.forEach((match, idx) => {
        const score1 =
          match.matchData?.score1 !== undefined ? match.matchData.score1 : "-";
        const score2 =
          match.matchData?.score2 !== undefined ? match.matchData.score2 : "-";
        const winner = match.matchData?.winner
          ? match.matchData.winner === "team1"
            ? match.team1.name
            : match.team2.name
          : "Chưa đấu";

        content += `TK${idx + 1}: ${match.team1.name} ${score1} - ${score2} ${
          match.team2.name
        }`;
        if (winner !== "Chưa đấu") content += ` → ${winner}`;
        content += "\n";
      });
      content += "\n";

      // Semifinals
      if (tournament.matches.knockout.quarterfinals.length > 0) {
        content += "▸ BÁN KẾT\n";
        content += "───────────────────────────────────────────────────────\n";
        const semifinals = bracketManager.getSemifinals();
        semifinals.forEach((match, idx) => {
          const team1Name = match.team1?.name || "???";
          const team2Name = match.team2?.name || "???";
          const score1 =
            match.matchData?.score1 !== undefined
              ? match.matchData.score1
              : "-";
          const score2 =
            match.matchData?.score2 !== undefined
              ? match.matchData.score2
              : "-";
          const winner = match.matchData?.winner
            ? match.matchData.winner === "team1"
              ? team1Name
              : team2Name
            : "Chưa đấu";

          content += `BK${
            idx + 1
          }: ${team1Name} ${score1} - ${score2} ${team2Name}`;
          if (winner !== "Chưa đấu") content += ` → ${winner}`;
          content += "\n";
        });
        content += "\n";
      }

      // Final
      if (tournament.matches.knockout.semifinals.length > 0) {
        content += "▸ CHUNG KẾT\n";
        content += "───────────────────────────────────────────────────────\n";
        const final = bracketManager.getFinal();
        const team1Name = final.team1?.name || "???";
        const team2Name = final.team2?.name || "???";
        const score1 =
          final.matchData?.score1 !== undefined ? final.matchData.score1 : "-";
        const score2 =
          final.matchData?.score2 !== undefined ? final.matchData.score2 : "-";
        const winner = bracketManager.getMatchWinner(final);

        content += `${team1Name} ${score1} - ${score2} ${team2Name}\n`;
        if (winner.name !== "???") {
          content += `\n🏆 VÔ ĐỊCH: ${winner.name}\n`;
        }
        content += "\n";
      }
    }

    // Footer
    content += "═══════════════════════════════════════════════════════\n";
    content += `Xuất lúc: ${new Date().toLocaleString("vi-VN")}\n`;
    content += "═══════════════════════════════════════════════════════\n";

    return content;
  }

  exportToTXT() {
    const content = this.generateTextContent();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dolphin-plaza-tournament-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    app.showMessage("Đã tải xuống file TXT!", "success");
  }

  async exportToPDF() {
    app.showMessage("Đang tạo PDF... Vui lòng đợi", "info");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    try {
      // Load fonts for Vietnamese support
      const fontBaseURL =
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto";

      const [fontRegular, fontBold] = await Promise.all([
        this.loadFont(`${fontBaseURL}/Roboto-Regular.ttf`),
        this.loadFont(`${fontBaseURL}/Roboto-Medium.ttf`),
      ]);

      doc.addFileToVFS("Roboto-Regular.ttf", fontRegular);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

      doc.addFileToVFS("Roboto-Bold.ttf", fontBold);
      doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

      doc.setFont("Roboto", "normal");
    } catch (error) {
      console.error("Lỗi tải font:", error);
      app.showMessage(
        "Lỗi tải phông chữ. PDF có thể bị lỗi hiển thị.",
        "error"
      );
    }

    let y = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    // Helper function to add text with page break
    const addText = (text, x = 20, fontSize = 10, style = "normal") => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(fontSize);
      // Ensure we stick to our custom font
      doc.setFont("Roboto", style);
      doc.text(text, x, y);
      y += lineHeight * (fontSize / 10);
    };

    // Title
    addText("DOLPHIN PLAZA PICKLEBALL TOURNAMENT 2026", 105, 16, "bold");
    doc.setTextColor(100);
    addText(`Xuất lúc: ${new Date().toLocaleString("vi-VN")}`, 105, 10);
    doc.setTextColor(0);
    y += 5;

    // Tournament Info
    addText(`Số đội tham gia: ${tournament.teams.length}/20`, 20, 11, "bold");
    addText(
      `Số trận vòng bảng: ${tournament.matches.groupStage.length}`,
      20,
      11,
      "bold"
    );
    y += 5;

    // Group Stage
    addText("KẾT QUẢ VÒNG BẢNG", 20, 14, "bold");
    y += 3;

    const groups = ["A", "B", "C", "D", "E"];
    groups.forEach((group) => {
      const standings = tournament.getGroupStandings(group);
      if (standings.length === 0) return;

      addText(`Bảng ${group}`, 20, 12, "bold");

      standings.forEach((team, idx) => {
        const text = `${idx + 1}. ${team.name} - ${team.stats.wins} thắng, ${
          team.stats.pointDiff > 0 ? "+" : ""
        }${team.stats.pointDiff} HS`;
        addText(text, 25, 10);
      });

      y += 3;
    });

    // Qualified Teams
    const qualified = tournament.getQualifiedTeams();
    if (qualified.length >= 8) {
      y += 5;
      addText("ĐỘI VÀO VÒNG TRONG (8 đội)", 20, 14, "bold");
      y += 3;

      qualified.slice(0, 8).forEach((team, idx) => {
        const label = idx < 5 ? "Nhất bảng" : "Nhì bảng";
        addText(
          `${idx + 1}. ${team.name} (Bảng ${team.group} - ${label})`,
          25,
          10
        );
      });

      // Knockout Results
      y += 5;
      addText("VÒNG LOẠI TRỰC TIẾP", 20, 14, "bold");
      y += 3;

      // Quarterfinals
      addText("Tứ kết", 20, 12, "bold");
      const quarterfinals = bracketManager.getQuarterfinals();
      quarterfinals.forEach((match, idx) => {
        const score1 =
          match.matchData?.score1 !== undefined ? match.matchData.score1 : "-";
        const score2 =
          match.matchData?.score2 !== undefined ? match.matchData.score2 : "-";
        const text = `TK${idx + 1}: ${match.team1.name} ${score1} - ${score2} ${
          match.team2.name
        }`;
        addText(text, 25, 10);
      });

      // Semifinals
      if (tournament.matches.knockout.quarterfinals.some((m) => m.winner)) {
        y += 3;
        addText("Bán kết", 20, 12, "bold");
        const semifinals = bracketManager.getSemifinals();
        semifinals.forEach((match, idx) => {
          const team1Name = match.team1?.name || "???";
          const team2Name = match.team2?.name || "???";
          const score1 =
            match.matchData?.score1 !== undefined
              ? match.matchData.score1
              : "-";
          const score2 =
            match.matchData?.score2 !== undefined
              ? match.matchData.score2
              : "-";
          const text = `BK${
            idx + 1
          }: ${team1Name} ${score1} - ${score2} ${team2Name}`;
          addText(text, 25, 10);
        });
      }

      // Final
      if (tournament.matches.knockout.semifinals.some((m) => m.winner)) {
        y += 3;
        addText("Chung kết", 20, 12, "bold");
        const final = bracketManager.getFinal();
        const team1Name = final.team1?.name || "???";
        const team2Name = final.team2?.name || "???";
        const score1 =
          final.matchData?.score1 !== undefined ? final.matchData.score1 : "-";
        const score2 =
          final.matchData?.score2 !== undefined ? final.matchData.score2 : "-";
        const text = `${team1Name} ${score1} - ${score2} ${team2Name}`;
        addText(text, 25, 10);

        const winner = bracketManager.getMatchWinner(final);
        if (winner.name !== "???") {
          y += 3;
          doc.setTextColor(255, 215, 0); // Gold
          addText(`VÔ ĐỊCH: ${winner.name}`, 20, 14, "bold");
          doc.setTextColor(0);
        }
      }
    }

    // Save PDF
    doc.save(`dolphin-plaza-tournament-${Date.now()}.pdf`);
    app.showMessage("Đã tải xuống file PDF!", "success");
  }

  // Optimize usage: fetch font as arraybuffer then convert to binary string (latin1) to minimize size overhead vs Base64 if possible,
  // but VFS expects Base64 or string. Binary string is standard for pdfmake/jspdf adds.
  async loadFont(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return this.arrayBufferToBase64(buffer);
  }

  arrayBufferToBase64(buffer) {
    let binary = "";
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Export Results to TXT (detailed group stage matches)
  exportResultsToTXT() {
    let content = "";

    // Header
    content += "═══════════════════════════════════════════════════════\n";
    content += "     KẾT QUẢ CHI TIẾT VÒNG BẢNG\n";
    content += "     DOLPHIN PLAZA PICKLEBALL TOURNAMENT 2026\n";
    content += "═══════════════════════════════════════════════════════\n\n";

    content += `Xuất lúc: ${new Date().toLocaleString("vi-VN")}\n`;
    content += `Tổng số trận đấu: ${tournament.matches.groupStage.length}\n\n`;

    const groups = ["A", "B", "C", "D", "E"];

    groups.forEach((group) => {
      const groupMatches = tournament.matches.groupStage.filter(
        (m) => m.group === group
      );

      if (groupMatches.length > 0) {
        content += `┌─ BẢNG ${group} ─────────────────────────────────────────┐\n`;
        content += `│ Số trận: ${groupMatches.length}                                      │\n`;
        content += `└──────────────────────────────────────────────────────┘\n\n`;

        groupMatches.forEach((match, idx) => {
          const team1 = tournament.teams.find((t) => t.id === match.team1);
          const team2 = tournament.teams.find((t) => t.id === match.team2);

          if (team1 && team2) {
            const date = new Date(match.timestamp).toLocaleDateString("vi-VN");
            content += `  Trận ${idx + 1} - ${date}\n`;
            content += `  ─────────────────────────────────────────────────\n`;
            content += `  ${team1.name.padEnd(25)} ${match.score1
              .toString()
              .padStart(2)}\n`;
            content += `    (${app.getTeamDisplayName(team1)})\n`;
            content += `  ${team2.name.padEnd(25)} ${match.score2
              .toString()
              .padStart(2)}\n`;
            content += `    (${app.getTeamDisplayName(team2)})\n`;

            const winner =
              match.score1 > match.score2 ? team1.name : team2.name;
            content += `  → Thắng: ${winner}\n\n`;
          }
        });

        content += "\n";
      }
    });

    // Footer
    content += "═══════════════════════════════════════════════════════\n";
    content += "           HẾT KẾT QUẢ VÒNG BẢNG\n";
    content += "═══════════════════════════════════════════════════════\n";

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ket-qua-vong-bang-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    app.showMessage("Đã tải xuống kết quả vòng bảng (TXT)!", "success");
  }

  // Export Results to PDF (detailed group stage matches)
  async exportResultsToPDF() {
    app.showMessage("Đang tạo PDF kết quả... Vui lòng đợi", "info");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    try {
      // Load fonts for Vietnamese support
      const fontBaseURL =
        "https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto";

      const [fontRegular, fontBold] = await Promise.all([
        this.loadFont(`${fontBaseURL}/Roboto-Regular.ttf`),
        this.loadFont(`${fontBaseURL}/Roboto-Medium.ttf`),
      ]);

      doc.addFileToVFS("Roboto-Regular.ttf", fontRegular);
      doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");

      doc.addFileToVFS("Roboto-Bold.ttf", fontBold);
      doc.addFont("Roboto-Bold.ttf", "Roboto", "bold");

      doc.setFont("Roboto", "normal");
    } catch (error) {
      console.error("Lỗi tải font:", error);
    }

    let y = 20;
    const lineHeight = 7;
    const pageHeight = doc.internal.pageSize.height;

    // Helper function to add text with page break
    const addText = (text, x = 20, fontSize = 10, style = "normal") => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(fontSize);
      doc.setFont("Roboto", style);
      doc.text(text, x, y);
      y += lineHeight * (fontSize / 10);
    };

    // Title
    addText("KẾT QUẢ CHI TIẾT VÒNG BẢNG", 105, 16, "bold");
    addText("DOLPHIN PLAZA PICKLEBALL TOURNAMENT 2026", 105, 12, "bold");
    doc.setTextColor(100);
    addText(`Xuất lúc: ${new Date().toLocaleString("vi-VN")}`, 105, 10);
    doc.setTextColor(0);
    y += 5;

    addText(
      `Tổng số trận: ${tournament.matches.groupStage.length}`,
      20,
      11,
      "bold"
    );
    y += 5;

    const groups = ["A", "B", "C", "D", "E"];

    groups.forEach((group) => {
      const groupMatches = tournament.matches.groupStage.filter(
        (m) => m.group === group
      );

      if (groupMatches.length > 0) {
        addText(`BẢNG ${group} - ${groupMatches.length} trận`, 20, 13, "bold");
        y += 2;

        groupMatches.forEach((match, idx) => {
          const team1 = tournament.teams.find((t) => t.id === match.team1);
          const team2 = tournament.teams.find((t) => t.id === match.team2);

          if (team1 && team2) {
            const date = new Date(match.timestamp).toLocaleDateString("vi-VN");

            // Match number and date
            doc.setTextColor(100);
            addText(`Trận ${idx + 1} - ${date}`, 25, 9);
            doc.setTextColor(0);

            // Team 1
            const team1Text = `${team1.name} - ${match.score1}`;
            addText(
              team1Text,
              30,
              11,
              match.score1 > match.score2 ? "bold" : "normal"
            );

            doc.setTextColor(100);
            addText(`(${app.getTeamDisplayName(team1)})`, 35, 8);
            doc.setTextColor(0);

            // Team 2
            const team2Text = `${team2.name} - ${match.score2}`;
            addText(
              team2Text,
              30,
              11,
              match.score2 > match.score1 ? "bold" : "normal"
            );

            doc.setTextColor(100);
            addText(`(${app.getTeamDisplayName(team2)})`, 35, 8);
            doc.setTextColor(0);

            y += 2;
          }
        });

        y += 3;
      }
    });

    // Save PDF
    doc.save(`ket-qua-vong-bang-${Date.now()}.pdf`);
    app.showMessage("Đã tải xuống kết quả vòng bảng (PDF)!", "success");
  }
}

const exportManager = new ExportManager();
