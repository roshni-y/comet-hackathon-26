function AnswerCard({ answer }) {
  return (
    <div style={styles.card}>
      <h3>📌 Answer</h3>
      <p>{answer}</p>
    </div>
  );
}

const styles = {
  card: {
    marginTop: "30px",
    width: "350px",
    padding: "20px",
    background: "rgba(0,0,0,0.4)",
    borderRadius: "12px"
  }
};

export default AnswerCard;