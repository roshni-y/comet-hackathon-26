import { useState } from "react";
import AnswerCard from "./AnswerCard";

function UploadForm() {
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [file, setFile] = useState(null);
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    // temporary dummy response
    setAnswer("Answer will appear here after backend integration.");
  };

  return (
    <div style={styles.container}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        >
          <option value="">Select Subject</option>
          <option value="physics">Physics</option>
          <option value="math">Math</option>
        </select>

        <input
          type="text"
          placeholder="Enter your question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <button type="submit">Find Answer</button>
      </form>

      {answer && <AnswerCard answer={answer} />}
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "60px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    width: "350px",
    padding: "30px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "15px",
    backdropFilter: "blur(10px)"
  }
};

export default UploadForm;