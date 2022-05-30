import React from "react";
import { Link } from "react-router-dom";


function Register() {
  return (
    <section className="auth">
      <h2 className="auth__title">Регистрация</h2>

      <form action="URL" className="auth__form" method="get">

        <input type="email" value="Email" className="auth__input" name="email"
          placeholder="Email" required></input>

        <input type="password" value="Password" className="auth__input"
          name="password" placeholder="Пароль" required></input>

        <button type="submit" className="auth__btn-submit">Зарегистрироваться</button>

      </form>
      <div className="auth__signup">
        <p className="auth__signup-text">Уже зарегистрированы?</p>
        <Link to="sign-in" className="auth__signup-link"> Войти </Link>
      </div>
    </section>
  );
}

export default Register;