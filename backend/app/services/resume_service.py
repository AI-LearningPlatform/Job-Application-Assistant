import os
import io
import textwrap
from typing import Dict, Any
from PyPDF2 import PdfReader
# from langchain_openai import ChatOpenAI
# from langchain.prompts import PromptTemplate

class ResumeService:
    def __init__(self):
        # We would initialize ChatOpenAI here if we had an API key
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.use_mock = not bool(self.api_key)

    def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from a PDF file."""
        try:
            reader = PdfReader(io.BytesIO(file_content))
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            raise Exception(f"Failed to parse PDF: {str(e)}")

    def tailor_resume(self, base_resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Tailor the base resume to match the job description using an LLM.
        """
        if self.use_mock:
            # Simulate LLM processing delay
            import time
            time.sleep(1.5)
            return {
                "tailored_summary": "Highly motivated professional with skills perfectly matching the job description.",
                "key_skills_to_highlight": ["Mock Skill 1", "Mock Skill 2", "Python", "React"],
                "suggested_bullet_points": [
                    "Engineered a scalable solution resulting in 20% performance increase.",
                    "Led cross-functional teams to deliver mock projects."
                ],
                "match_score": 85
            }
        
        # Real LLM implementation would go here:
        # llm = ChatOpenAI(temperature=0.2, api_key=self.api_key)
        # prompt = PromptTemplate(template="...", input_variables=["resume", "job"])
        # chain = prompt | llm
        # result = chain.invoke({"resume": base_resume_text, "job": job_description})
        # return parse_llm_result(result)
        
        return {}

    def build_tailored_resume_preview(self, file_content: bytes, job_description: str) -> Dict[str, Any]:
        base_resume_text = self.extract_text_from_pdf(file_content)
        tailored_data = self.tailor_resume(base_resume_text, job_description)
        tailored_data["base_resume_preview"] = base_resume_text[:1200]
        return tailored_data

    def generate_tailored_pdf(self, tailored_summary: str, skills: str, bullet_points: str, job_description: str) -> bytes:
        lines = [
            "Tailored Resume",
            "",
            "Professional Summary",
            tailored_summary,
            "",
            "Key Skills",
            skills,
            "",
            "Suggested Experience Bullets",
        ]
        lines.extend([f"- {line.strip()}" for line in bullet_points.splitlines() if line.strip()])
        lines.extend(["", "Target Job Description", job_description[:1600]])
        return self._simple_pdf(lines)

    def _simple_pdf(self, lines: list[str]) -> bytes:
        wrapped_lines: list[str] = []
        for line in lines:
            if not line:
                wrapped_lines.append("")
                continue
            wrapped_lines.extend(textwrap.wrap(line, width=88) or [""])

        pages = [wrapped_lines[index:index + 42] for index in range(0, len(wrapped_lines), 42)] or [[]]
        objects: list[bytes] = [
            b"<< /Type /Catalog /Pages 2 0 R >>",
            b"<< /Type /Pages /Kids [PAGES_PLACEHOLDER] /Count COUNT_PLACEHOLDER >>",
        ]
        page_object_ids = []

        for page_lines in pages:
            content = self._pdf_text_stream(page_lines)
            content_id = len(objects) + 2
            page_id = len(objects) + 1
            page_object_ids.append(page_id)
            objects.append(
                f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /Contents {content_id} 0 R >>".encode()
            )
            objects.append(f"<< /Length {len(content)} >>\nstream\n".encode() + content + b"\nendstream")

        kids = " ".join(f"{page_id} 0 R" for page_id in page_object_ids).encode()
        objects[1] = objects[1].replace(b"PAGES_PLACEHOLDER", kids).replace(b"COUNT_PLACEHOLDER", str(len(pages)).encode())

        output = io.BytesIO()
        output.write(b"%PDF-1.4\n")
        offsets = [0]
        for index, obj in enumerate(objects, start=1):
            offsets.append(output.tell())
            output.write(f"{index} 0 obj\n".encode())
            output.write(obj)
            output.write(b"\nendobj\n")

        xref_position = output.tell()
        output.write(f"xref\n0 {len(objects) + 1}\n".encode())
        output.write(b"0000000000 65535 f \n")
        for offset in offsets[1:]:
            output.write(f"{offset:010d} 00000 n \n".encode())
        output.write(f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_position}\n%%EOF".encode())
        return output.getvalue()

    def _pdf_text_stream(self, lines: list[str]) -> bytes:
        stream = ["BT", "/F1 11 Tf", "50 750 Td", "14 TL"]
        for line in lines:
            stream.append(f"({self._escape_pdf_text(line)}) Tj")
            stream.append("T*")
        stream.append("ET")
        return "\n".join(stream).encode("latin-1", errors="replace")

    def _escape_pdf_text(self, value: str) -> str:
        return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")

resume_service = ResumeService()
