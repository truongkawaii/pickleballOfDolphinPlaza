// Pre-populated team data
const initialTeamsData = [
  // Bảng A
  {
    id: "team-01",
    name: "Đội 01",
    group: "A",
    players: [
      { name: "Đào Huy Hiếu", gender: "M" },
      { name: "Phạm Xuân Kiển", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-02",
    name: "Đội 02",
    group: "A",
    players: [
      { name: "Tăng Phúc Minh", gender: "M" },
      { name: "Trần Thanh Bình", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-03",
    name: "Đội 03",
    group: "A",
    players: [
      { name: "Phạm Phú Yên", gender: "M" },
      { name: "Đỗ Hương", gender: "F" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-04",
    name: "Đội 04",
    group: "A",
    players: [
      { name: "Cấn Minh Đức", gender: "M" },
      { name: "Phạm Hùng Cường", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },

  // Bảng B
  {
    id: "team-05",
    name: "Đội 05",
    group: "B",
    players: [
      { name: "Lê Trung Lợi", gender: "M" },
      { name: "Vũ Thế Phúc", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-06",
    name: "Đội 06",
    group: "B",
    players: [
      { name: "Bùi Văn Loan", gender: "M" },
      { name: "Trần Minh Nguyệt", gender: "F" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-07",
    name: "Đội 07",
    group: "B",
    players: [
      { name: "Nguyễn Chí Hiếu", gender: "M" },
      { name: "Nguyễn Tuấn Hưng", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-08",
    name: "Đội 08",
    group: "B",
    players: [
      { name: "Nguyễn Hoàng Công", gender: "M" },
      { name: "Nguyễn Xuân Bách", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },

  // Bảng C
  {
    id: "team-09",
    name: "Đội 09",
    group: "C",
    players: [
      { name: "Trần Văn Lợi", gender: "M" },
      { name: "Bùi Bình Minh", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-10",
    name: "Đội 10",
    group: "C",
    players: [
      { name: "Hoàng Mạnh Hùng", gender: "M" },
      { name: "Lê Đức Thọ", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-11",
    name: "Đội 11",
    group: "C",
    players: [
      { name: "Đào Viết Cường", gender: "M" },
      { name: "Nguyễn Khánh Linh", gender: "F" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-12",
    name: "Đội 12",
    group: "C",
    players: [
      { name: "Phạm Văn Sáng", gender: "M" },
      { name: "Nguyễn Phương Dung", gender: "F" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },

  // Bảng D
  {
    id: "team-13",
    name: "Đội 13",
    group: "D",
    players: [
      { name: "Tăng Hoàng Bảo", gender: "M" },
      { name: "Vũ Hồng Quảng", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-14",
    name: "Đội 14",
    group: "D",
    players: [
      { name: "Đinh Thế Mạnh", gender: "M" },
      { name: "Phương Anh", gender: "F" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-15",
    name: "Đội 15",
    group: "D",
    players: [
      { name: "Phùng Quang Huy", gender: "M" },
      { name: "Lê Văn Phúc", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-16",
    name: "Đội 16",
    group: "D",
    players: [
      { name: "Trần Tùng", gender: "M" },
      { name: "Nguyễn Đức Hoan", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },

  // Bảng E
  {
    id: "team-17",
    name: "Đội 17",
    group: "E",
    players: [
      { name: "Nguyễn Ngọc Thắng", gender: "M" },
      { name: "Hà Phương", gender: "F" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-18",
    name: "Đội 18",
    group: "E",
    players: [
      { name: "Vũ Xuân Thịnh", gender: "M" },
      { name: "Nguyễn Tất Tâm", gender: "M" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-19",
    name: "Đội 19",
    group: "E",
    players: [
      { name: "Tuấn Anh", gender: "M" },
      { name: "Nguyễn Cúc", gender: "F" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
  {
    id: "team-20",
    name: "Đội 20",
    group: "E",
    players: [
      { name: "Bùi Văn Côn", gender: "M" },
      { name: "Lê Hải Linh", gender: "F" },
    ],
    stats: { wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0, pointDiff: 0 },
  },
];
