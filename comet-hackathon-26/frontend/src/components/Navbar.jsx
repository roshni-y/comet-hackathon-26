function Navbar() {
  return (
    <div style={styles.nav}>
      <h2>🚀 Comet Study Assistant</h2>
    </div>
  );
}

const styles = {
  nav: {
    padding: "20px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: "bold",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(10px)"
  }
};

export default Navbar;