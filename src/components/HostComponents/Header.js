// import styles from "../../css/Host.module.css";

function Header({ title, user }) {
  return (
    <header>
      <div className="left">
        <div className="logo">
          <img src="https://medicallearninghub.com/assets/img/logo-white.png" />
        </div>
        <div className="title">
          <h3>{title}</h3>
        </div>
      </div>

      <div className="center"> </div>

      <div className="right">
        <div className="avatar">
          <i className="bi bi-person-circle"></i>
        </div>
        <h3 className="user-name">{user}</h3>
      </div>
    </header>
  );
}

export default Header;
