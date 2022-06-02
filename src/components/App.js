import React, { useState } from 'react';
import { Route, Switch, Redirect, useHistory } from 'react-router-dom';
import { api } from "../utils/api";
import { CurrentUserContext } from '../contexts/CurrentUserContext';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import DeleteCardPopup from './DeleteCardPopup';
import ProtectedRoute from "./ProtectedRoute"; 
import Login from './Login';
import Register from './Register';
import InfoTooltip from './InfoTooltip';
import * as auth from "../utils/auth";




function App() {

    const [isEditProfile, setIsEditProfile] = useState(false);
    const [isAddPlace, setIsAddPlace] = useState(false);
    const [isEditAvatar, setIsEditAvatar] = useState(false);
    const [isImgView, setIsImgView] = useState(false);
    const [isDelete, setIsDelete] = useState(false);
    const [selectedCard, setSelectedCard] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const [cards, setCards] = useState([]);
    const history = useHistory();
    const[email, setEmail] = useState('')

    const [isLoggedIn, setIsLoggedIn] = useState(false); //статус пользователя автоизирван или нет
    const [isAuthOk, setIsAuthOk] = useState(true); // успешна ли авторизация
    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false); //попап

    function checkToken(){
        const jwt = localStorage.getItem("jwt");
        if(jwt) {
            auth.checkToken(jwt)
            .then((data)=>{
                if(data){
                    setIsLoggedIn(true);
                    history.push("/");
                    setEmail(data.data.email);
                }
            })
            .catch((err) => {
                if (err === 400) {console.log("Токен не передан или передан не в том формате")}
                else if (err === 401) {console.log("Переданный токен некорректен ")}
            })
        }
    }

    React.useEffect(() => {
        checkToken();
        if (isLoggedIn) {

            Promise.all([api.getProfile(), api.getCardInfo()])
                .then(
                    ([userData, cardList]) => {
                        setCurrentUser(userData);
                        setCards(cardList);
                    })
                .catch((err) => console.log(err))
        }

    }, [isLoggedIn]);

    function handleCardLike(card) {
        // Снова проверяем, есть ли уже лайк на этой карточке
        const isLiked = card.likes.some(i => i._id === currentUser._id);

        // Отправляем запрос в API и получаем обновлённые данные карточки
        api.changeStatusLike(card._id, !isLiked).then((newCard) => {
            setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
        })
            .catch((err) => console.log(err))
    }

    function handleCardDelete({ card }) {
        api.deleteCard(card._id)
            .then((res) => {
                setCards((state) =>
                    state.filter((c) => c._id !== card._id)
                )
                handleClosePopup();
            })
            .catch((err) => console.log(err));

    }

    function handleEditProfileClick() {
        setIsEditProfile(true);
    }

    function handleAddPlaceClick() {
        setIsAddPlace(true);
    }

    function handleEditAvatarClick() {
        setIsEditAvatar(true);
    }

    function handleImgClick(card) {
        setIsImgView(true);
        setSelectedCard(card)
    }

    function handleDeleteClick(card) {
        setIsDelete(true);
        setSelectedCard(card)
    }

    function handleClosePopup() {
        setIsEditProfile(false);
        setIsAddPlace(false);
        setIsEditAvatar(false);
        setIsImgView(false);
        setIsDelete(false);
        setIsInfoTooltipOpen(false);
    }

    function handleUpdateUser(info) {
        api.postUserInfo(info)
            .then((res) => {
                setCurrentUser(res);
                handleClosePopup();

            })
            .catch((err) => console.log(err))
    }

    function handleUpdateAvatar(obj) {
        api.changeAvatar(obj)
            .then((res) => {
                setCurrentUser(res);
                handleClosePopup();

            })
            .catch((err) => console.log(err))
    }

    function handleAddPlaceSubmit(obj) {
        api.postCardInfo(obj)
            .then((newCard) => {
                setCards([newCard, ...cards]);
                handleClosePopup();
            })
            .catch((err) => console.log(err))
    }

    function handleRegisterSubmit(password, email) {
        auth.register(password, email)
            .then((res) => {
                setIsInfoTooltipOpen(true);
                setIsAuthOk(true);
                history.push("/sign-in");
            })
            .catch((err) => {
                if (err.status === 400) { console.log("400: не передано одно из полей"); }
                setIsInfoTooltipOpen(true);
                setIsAuthOk(false);

            });
    }

    function handleLoginSubmit(password, email) {
        auth.login(password, email)
            .then((res) => {
                localStorage.setItem("jwt", res.token);
                setIsLoggedIn(true);
                setEmail(email);
                history.push("/");
            })
            .catch((err) => {
                if (err.status === 400) {
                    console.log("400: не передано одно из полей");
                } else if (err.status === 401) { console.log("400: пользователь с email не найден") }
                setIsInfoTooltipOpen(true);
                setIsAuthOk(false);
            });
    }

    function handleGetOut() {
        localStorage.removeItem("jwt");
        setIsLoggedIn(false);
        history.push("/sign-in");
    }

    return (
        <CurrentUserContext.Provider value={currentUser}>

            <div className="page">
                <Header email={email} onGetOut={handleGetOut} isLoggedIn={isLoggedIn}/>

                <Switch>
                    <ProtectedRoute exact path="/" isLoggedIn={isLoggedIn}>
                        <Main
                            onEditAvatar={handleEditAvatarClick}
                            onEditPofile={handleEditProfileClick}
                            onNewPlace={handleAddPlaceClick}
                            onView={handleImgClick}
                            cards={cards}
                            onCardLike={handleCardLike}
                            onCardDelete={handleDeleteClick}
                        />
                    </ProtectedRoute> 

                    <Route path="/sign-up">
                        <Register onRegister={handleRegisterSubmit}/>
                    </Route>

                    <Route path="/sign-in">
                        <Login onLogin={handleLoginSubmit}/>
                    </Route>

                    <Route>
                        {isLoggedIn ? <Redirect to="/"/> : <Redirect to="sign-in"/>}
                    </Route>
                </Switch>

                <Footer />
                <ImagePopup
                    card={selectedCard}
                    isOpen={isImgView}
                    closePopup={handleClosePopup}
                />
                <EditProfilePopup
                    isOpen={isEditProfile}
                    onClose={handleClosePopup}
                    onUpdateUser={handleUpdateUser}
                />
                <EditAvatarPopup
                    isOpen={isEditAvatar}
                    onClose={handleClosePopup}
                    onUpdateAvatar={handleUpdateAvatar}
                />
                <AddPlacePopup
                    isOpen={isAddPlace}
                    onClose={handleClosePopup}
                    onAddPlace={handleAddPlaceSubmit}
                />
                <DeleteCardPopup
                    card={selectedCard}
                    isOpen={isDelete}
                    onClose={handleClosePopup}
                    onDelete={handleCardDelete}
                />
                <InfoTooltip
                    isAuthOk={isAuthOk}
                    onClose={handleClosePopup}
                    isOpen={isInfoTooltipOpen}
                />
            </div>

        </CurrentUserContext.Provider>
    );
}

export default App;
