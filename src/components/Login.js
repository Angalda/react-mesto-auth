import React from "react";


function Login() {
    return (
        <section className="auth">
            <h2 className="auth__title">Вход</h2>

            <form action="URL" className="auth__form" method="get">

                <input type="email" value="Email" className="auth__input"  name="email"
                    placeholder="Email" required></input>
                
                <input type="password" value="Password" className="auth__input"
                    name="password" placeholder="Пароль" required></input>
               
                <button type="submit" className="auth__btn-submit">Войти</button>

            </form>
        </section>
    );
}

export default Login;