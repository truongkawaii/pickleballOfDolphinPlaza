import { GoogleGenAI, Type } from "@google/genai";
import {
  UserProfile,
  FortuneResult,
  LoveCompatibility,
  ComprehensiveReading,
} from "../types";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
};

export const getDailyFortune = async (
  profile: UserProfile
): Promise<FortuneResult> => {
  const ai = getAIClient();
  const prompt = `Bạn là một thầy phong thủy và chuyên gia tử vi phương Đông lẫn phương Tây. 
  Dựa trên thông tin người dùng: 
  Tên: ${profile.name}
  Ngày sinh: ${profile.birthDate}
  Giờ sinh: ${profile.birthTime}

  
  Hãy luận giải tử vi ngày hôm nay cho người này. Luận giải cần sâu sắc, huyền bí nhưng mang tính khích lệ.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING,
            description: "Tổng quan vận mệnh ngày hôm nay",
          },
          career: {
            type: Type.STRING,
            description: "Luận về công danh sự nghiệp",
          },
          love: {
            type: Type.STRING,
            description: "Luận về tình duyên, cảm xúc",
          },
          health: {
            type: Type.STRING,
            description: "Luận về sức khỏe và năng lượng",
          },
          luckyNumber: { type: Type.STRING, description: "Con số may mắn" },
          luckyColor: {
            type: Type.STRING,
            description: "Màu sắc mang lại tài lộc",
          },
        },
        required: [
          "summary",
          "career",
          "love",
          "health",
          "luckyNumber",
          "luckyColor",
        ],
      },
    },
  });

  return JSON.parse(response.text || "{}") as FortuneResult;
};

export const checkLoveCompatibility = async (
  p1: UserProfile,
  p2: UserProfile
): Promise<LoveCompatibility> => {
  const ai = getAIClient();
  const prompt = `Bạn là một chuyên gia về nhân duyên và thần số học. 
  Hãy xem bói tình duyên cho cặp đôi:
  Người 1: ${p1.name}, sinh ngày ${p1.birthDate}
  Người 2: ${p2.name}, sinh ngày ${p2.birthDate}
  
  Hãy luận giải sự tương hợp giữa hai người dựa trên cung hoàng đạo, can chi và ngũ hành.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: {
            type: Type.NUMBER,
            description: "Điểm tương hợp từ 0 đến 100",
          },
          verdict: {
            type: Type.STRING,
            description: "Lời kết luận về mối quan hệ",
          },
          advice: {
            type: Type.STRING,
            description: "Lời khuyên để duy trì hạnh phúc",
          },
          pros: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Điểm hợp nhau",
          },
          cons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Điểm xung khắc cần lưu ý",
          },
        },
        required: ["score", "verdict", "advice", "pros", "cons"],
      },
    },
  });

  return JSON.parse(response.text || "{}") as LoveCompatibility;
};

export const getComprehensiveReading = async (
  profile: UserProfile
): Promise<ComprehensiveReading> => {
  const ai = getAIClient();
  const prompt = `Bạn là một chuyên gia Tử Vi hàng đầu Việt Nam với kiến thức sâu rộng về Tử Vi Đẩu Số. 
  
  Hãy luận giải TOÀN DIỆN và CHI TIẾT lá số tử vi cho người dùng:
  - Họ tên: ${profile.name}
  - Ngày tháng năm sinh: ${profile.birthDate}
  - Giờ sinh: ${profile.birthTime}
  
  YÊU CẦU QUAN TRỌNG VỀ NỘI DUNG:
  - Mỗi phần phải CỰC KỲ CHI TIẾT, dài từ 800-1500 từ
  - Sử dụng thuật ngữ Tử Vi chuyên môn (Âm Dương, Ngũ Hành, Hóa Lộc/Quyền/Khoa/Kỵ, v.v.)
  - Phân tích SÂU SẮC từng khía cạnh, không được tóm tắt
  - Giải thích rõ ràng ảnh hưởng của từng sao, từng yếu tố
  - Đưa ra lời khuyên CỤ THỂ và THỰC TẾ
  
  YÊU CẦU QUAN TRỌNG VỀ ĐỊNH DẠNG:
  - Sử dụng subsection headers kết thúc bằng dấu hai chấm (:)
  - Sử dụng bullet points chính với ký tự (•) cho các điểm quan trọng
  - Sử dụng nested points với ký tự (*) cho chi tiết bổ sung
  - Mỗi dòng mới phải xuống hàng rõ ràng
  
  VÍ DỤ ĐỊNH DẠNG:
  
  Phân Tích Nội Cung:
  • Chính Tinh Thiên Lương đắc địa tại Sửu cho thấy bạn là người nhân hậu, có đạo đức.
    * Thiên Lương là phúc tinh, mang lại sự che chở và phúc đức.
    * Khi đắc địa, tính chất này càng được phát huy mạnh mẽ.
  • Quốc Ấn và Tướng Quân đồng cung tạo cách "Ấn Tướng triều Viên".
    * Bạn có khả năng lãnh đạo bẩm sinh.
    * Được nhiều người nể trọng và tin tưởng.
  
  Hãy phân tích theo cấu trúc sau (8 phần chính):

  1. TỔNG QUAN LÁ SỐ (1000-1500 từ)
     
     Xét Âm Dương Thuận/Nghịch Lý:
     • [Phân tích chi tiết]
       * [Chi tiết bổ sung]
     
     Xét Ngũ Hành Bản Mệnh và Cục:
     • [Phân tích tương sinh tương khắc]
       * [Ảnh hưởng cụ thể]
     
     Nhận định Cách Cục Chính Tinh:
     • [Phân tích Mệnh, Tài Bạch, Quan Lộc]
     
     Nhận định các Vòng Sao Chính:
     • [Vòng Thái Tuế, Lộc Tồn, Tràng Sinh]
  
  2. PHÂN TÍCH CUNG MỆNH & THÂN (1200-1800 từ)
     
     Phân Tích Cung Mệnh:
     • [Chính tinh, phụ tinh, tứ hóa]
       * [Chi tiết từng sao]
     
     Tính Cách và Tài Năng:
     • [Phân tích chi tiết]
     
     Phân Tích Cung Thân:
     • [Mục tiêu hậu vận, môi trường]
     
     So Sánh Mệnh & Thân:
     • [Đối chiếu và phân tích]
  
  3. LUẬN CUNG MỆNH (1500-2000 từ)
     
     Phân Tích Nội Cung:
     • [Tất cả các sao trong cung]
       * [Ảnh hưởng từng sao]
     
     Phân Tích Tam Phương Tứ Chính:
     • [3 cung tam hợp + 1 cung xung]
       * [Chi tiết từng cung]
     
     Phân Tích Giáp Cung:
     • [2 cung bên cạnh]
     
     Phân Tích Phi Tinh Tứ Hóa:
     • [Hóa Lộc, Quyền, Khoa, Kỵ]
       * [Ảnh hưởng cụ thể]
     
     Lai Nhân Cung:
     • [Ý nghĩa và tác động]
     
     Tổng Kết:
     • [Mức độ tốt xấu, tiềm năng]
     • [Lời khuyên cụ thể]
  
  4-8. [Các phần còn lại theo cấu trúc tương tự]
  
  LƯU Ý QUAN TRỌNG:
  - MỖI PHẦN PHẢI DÀI VÀ CHI TIẾT
  - BẮT BUỘNG sử dụng ký tự • cho bullet points chính
  - BẮT BUỘNG sử dụng ký tự * cho nested points
  - BẮT BUỘNG kết thúc subsection headers bằng dấu :
  - Mỗi bullet/nested point phải trên một dòng riêng
  - Giải thích RÕ RÀNG ý nghĩa của TỪNG SAO, TỪNG YẾU TỐ
  - Tổng độ dài: 8000-12000 từ`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: {
            type: Type.STRING,
            description:
              "Tổng quan chi tiết 1000-1500 từ. Sử dụng subsection headers (kết thúc bằng :), bullet points (•), và nested points (*)",
          },
          sections: {
            type: Type.ARRAY,
            description:
              "Mảng 7 phần phân tích, mỗi phần 800-2000 từ với format có cấu trúc",
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: "ID duy nhất",
                },
                title: { type: Type.STRING, description: "Tiêu đề section" },
                content: {
                  type: Type.STRING,
                  description:
                    "Nội dung CỰC KỲ CHI TIẾT 800-2000 từ. BẮT BUỘC sử dụng:\n- Subsection headers kết thúc bằng :\n- Bullet points chính với •\n- Nested points với *\n- Mỗi dòng xuống hàng rõ ràng",
                },
              },
              required: ["id", "title", "content"],
            },
            minItems: 7,
          },
        },
        required: ["overview", "sections"],
      },
      maxOutputTokens: 8192,
      temperature: 0.9,
    },
  });

  return JSON.parse(response.text || "{}") as ComprehensiveReading;
};
