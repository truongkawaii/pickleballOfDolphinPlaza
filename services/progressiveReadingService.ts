import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, ReadingChunk } from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

// Define all 14 chunk prompts
const CHUNK_DEFINITIONS = [
  {
    id: "overview",
    title: "Tổng Quan Lá Số",
    prompt: (
      profile: UserProfile
    ) => `Bạn là chuyên gia Tử Vi hàng đầu Việt Nam.
    
Luận giải TỔNG QUAN LÁ SỐ cho:
- Họ tên: ${profile.name}
- Ngày sinh: ${profile.birthDate}
- Giờ sinh: ${profile.birthTime}

YÊU CẦU:
- Độ dài: 1000-1500 từ
- Sử dụng format: subsection headers (:), bullet points (•), nested points (*)

Nội dung bao gồm:

Xét Âm Dương Thuận/Nghịch Lý:
• [Phân tích chi tiết ảnh hưởng]
  * [Chi tiết cụ thể]

Xét Ngũ Hành Bản Mệnh và Cục:
• [Phân tích tương sinh tương khắc]
  * [Ảnh hưởng cụ thể]

Nhận Định Cách Cục Chính Tinh:
• [Phân tích Mệnh, Tài Bạch, Quan Lộc]

Nhận Định Vòng Sao Chính:
• [Vòng Thái Tuế, Lộc Tồn, Tràng Sinh]

Đánh Giá Tổng Thể:
• [Kết hợp và tiềm năng]`,
  },
  {
    id: "menh-than-1",
    title: "Phân Tích Cung Mệnh",
    prompt: (
      profile: UserProfile
    ) => `Luận giải CHI TIẾT CUNG MỆNH cho ${profile.name}.

YÊU CẦU: 800-1000 từ, format có cấu trúc (•, *, :)

Phân Tích Nội Cung:
• [Chính tinh và đặc điểm]
  * [Ảnh hưởng từng sao]
• [Phụ tinh hội chiếu]
  * [Tác động cụ thể]

Tính Cách và Ngoại Hình:
• [Phân tích chi tiết]

Tài Năng Bẩm Sinh:
• [Khả năng đặc biệt]`,
  },
  {
    id: "menh-than-2",
    title: "Phân Tích Cung Thân & So Sánh",
    prompt: (
      profile: UserProfile
    ) => `Luận giải CUNG THÂN và SO SÁNH với Cung Mệnh cho ${profile.name}.

YÊU CẦU: 800-1000 từ

Phân Tích Cung Thân:
• [Mục tiêu hậu vận]
• [Môi trường phát triển]

So Sánh Mệnh & Thân:
• [Từ tĩnh đến động]
• [Sự chuyển hóa]`,
  },
  {
    id: "luan-menh-1",
    title: "Luận Cung Mệnh - Nội Cung & Tam Phương",
    prompt: (
      profile: UserProfile
    ) => `Luận CUNG MỆNH chi tiết - Phần 1 cho ${profile.name}.

YÊU CẦU: 1000-1200 từ

Phân Tích Nội Cung:
• [Tất cả các sao]
  * [Ảnh hưởng từng sao]

Tam Phương Tứ Chính:
• [Cung xung chiếu]
• [Cung tam hợp 1]
• [Cung tam hợp 2]
• [Cung tam hợp 3]`,
  },
  {
    id: "luan-menh-2",
    title: "Luận Cung Mệnh - Giáp Cung & Tứ Hóa",
    prompt: (
      profile: UserProfile
    ) => `Luận CUNG MỆNH chi tiết - Phần 2 cho ${profile.name}.

YÊU CẦU: 1000-1200 từ

Phân Tích Giáp Cung:
• [Cung bên trái]
• [Cung bên phải]
• [Ảnh hưởng lẫn nhau]

Phi Tinh Tứ Hóa:
• [Hóa Lộc]
  * [Ảnh hưởng cụ thể]
• [Hóa Quyền]
• [Hóa Khoa]
• [Hóa Kỵ]`,
  },
  {
    id: "luan-menh-3",
    title: "Luận Cung Mệnh - Lai Nhân & Tổng Kết",
    prompt: (
      profile: UserProfile
    ) => `Luận CUNG MỆNH chi tiết - Phần 3 cho ${profile.name}.

YÊU CẦU: 600-800 từ

Lai Nhân Cung:
• [Ý nghĩa và tác động]
• [Duyên nghiệp]

Tổng Kết:
• [Mức độ tốt xấu]
• [Tiềm năng]
• [Lời khuyên cụ thể]`,
  },
  {
    id: "phu-mau-1",
    title: "Luận Cung Phụ Mẫu - Phần 1",
    prompt: (
      profile: UserProfile
    ) => `Luận CUNG PHỤ MẪU - Phần 1 cho ${profile.name}.

YÊU CẦU: 800-1000 từ

Phân Tích Nội Cung:
• [Tính cách cha mẹ]
• [Hoàn cảnh gia đình]

Tam Phương Tứ Chính:
• [Ảnh hưởng đến cha mẹ]`,
  },
  {
    id: "phu-mau-2",
    title: "Luận Cung Phụ Mẫu - Phần 2",
    prompt: (
      profile: UserProfile
    ) => `Luận CUNG PHỤ MẪU - Phần 2 cho ${profile.name}.

YÊU CẦU: 600-800 từ

Giáp Cung & Phi Tinh Tứ Hóa:
• [Mối quan hệ]
• [Sự hỗ trợ]

Tổng Kết:
• [Lời khuyên]`,
  },
  {
    id: "phuc-duc-1",
    title: "Luận Cung Phúc Đức - Phần 1",
    prompt: (
      profile: UserProfile
    ) => `Luận CUNG PHÚC ĐỨC - Phần 1 cho ${profile.name}.

YÊU CẦU: 1000-1200 từ

Phân Tích Nội Cung:
• [Phúc khí, thọ mệnh]
• [Tâm linh]

Tam Phương Tứ Chính:
• [Ảnh hưởng đến phúc đức]`,
  },
  {
    id: "phuc-duc-2",
    title: "Luận Cung Phúc Đức - Phần 2",
    prompt: (
      profile: UserProfile
    ) => `Luận CUNG PHÚC ĐỨC - Phần 2 cho ${profile.name}.

YÊU CẦU: 800-1000 từ

Phi Tinh Tứ Hóa:
• [Cách phúc khí vận hành]

Lai Nhân & Tổng Kết:
• [Ý nghĩa sâu xa]
• [Lời khuyên]`,
  },
  {
    id: "dien-trach",
    title: "Luận Cung Điền Trạch",
    prompt: (profile: UserProfile) => `Luận CUNG ĐIỀN TRẠCH cho ${profile.name}.

YÊU CẦU: 1000-1200 từ

Phân Tích Nội Cung:
• [Tài sản, nhà cửa]

Tam Phương & Giáp Cung:
• [Khả năng tích lũy]

Phi Tinh Tứ Hóa:
• [Nguồn gốc tài sản]

Tổng Kết:
• [Tiềm năng, lời khuyên]`,
  },
  {
    id: "quan-loc-1",
    title: "Luận Cung Quan Lộc - Phần 1",
    prompt: (
      profile: UserProfile
    ) => `Luận CUNG QUAN LỘC - Phần 1 cho ${profile.name}.

YÊU CẦU: 1000-1200 từ

Phân Tích Nội Cung:
• [Sự nghiệp, công danh]

Tam Phương Tứ Chính:
• [Triển vọng sự nghiệp]`,
  },
  {
    id: "quan-loc-2",
    title: "Luận Cung Quan Lộc - Phần 2",
    prompt: (
      profile: UserProfile
    ) => `Luận CUNG QUAN LỘC - Phần 2 cho ${profile.name}.

YÊU CẦU: 800-1000 từ

Phi Tinh Tứ Hóa:
• [Con đường phát triển]

Ngành Nghề Phù Hợp:
• [Chi tiết cụ thể]

Tổng Kết:
• [Tiềm năng, thách thức]`,
  },
  {
    id: "no-boc",
    title: "Luận Cung Nô Bộc",
    prompt: (profile: UserProfile) => `Luận CUNG NÔ BỘC cho ${profile.name}.

YÊU CẦU: 800-1000 từ

Phân Tích Nội Cung:
• [Bạn bè, đồng nghiệp]

Tam Phương & Phi Tinh Tứ Hóa:
• [Quý nhân, tiểu nhân]

Tổng Kết:
• [Lời khuyên giao tiếp]`,
  },
];

export async function* generateReadingChunks(
  profile: UserProfile
): AsyncGenerator<ReadingChunk> {
  const ai = getAIClient();

  for (let i = 0; i < CHUNK_DEFINITIONS.length; i++) {
    const def = CHUNK_DEFINITIONS[i];

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: def.prompt(profile),
        config: {
          maxOutputTokens: 2048,
          temperature: 0.9,
        },
      });

      yield {
        chunkId: i,
        sectionId: def.id,
        title: def.title,
        content: response.text || "",
        isComplete: true,
      };
    } catch (error) {
      yield {
        chunkId: i,
        sectionId: def.id,
        title: def.title,
        content: "",
        isComplete: false,
        error: error instanceof Error ? error.message : "Lỗi không xác định",
      };
    }
  }
}

export const getTotalChunks = () => CHUNK_DEFINITIONS.length;
