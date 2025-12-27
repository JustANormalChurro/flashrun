import AuthRedirect from './pages/AuthRedirect';
import TeacherDashboard from './pages/TeacherDashboard';
import ManageRooms from './pages/ManageRooms';
import CreateRoom from './pages/CreateRoom';
import RoomDetail from './pages/RoomDetail';


export const PAGES = {
    "AuthRedirect": AuthRedirect,
    "TeacherDashboard": TeacherDashboard,
    "ManageRooms": ManageRooms,
    "CreateRoom": CreateRoom,
    "RoomDetail": RoomDetail,
}

export const pagesConfig = {
    mainPage: "AuthRedirect",
    Pages: PAGES,
};