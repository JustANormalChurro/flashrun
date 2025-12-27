import AuthRedirect from './pages/AuthRedirect';
import TeacherDashboard from './pages/TeacherDashboard';
import ManageRooms from './pages/ManageRooms';
import CreateRoom from './pages/CreateRoom';
import RoomDetail from './pages/RoomDetail';
import CreateTest from './pages/CreateTest';
import EditTest from './pages/EditTest';
import CreateAssignment from './pages/CreateAssignment';
import EditAssignment from './pages/EditAssignment';
import CreateAnnouncement from './pages/CreateAnnouncement';
import EditAnnouncement from './pages/EditAnnouncement';
import TestResults from './pages/TestResults';
import AssignmentResults from './pages/AssignmentResults';


export const PAGES = {
    "AuthRedirect": AuthRedirect,
    "TeacherDashboard": TeacherDashboard,
    "ManageRooms": ManageRooms,
    "CreateRoom": CreateRoom,
    "RoomDetail": RoomDetail,
    "CreateTest": CreateTest,
    "EditTest": EditTest,
    "CreateAssignment": CreateAssignment,
    "EditAssignment": EditAssignment,
    "CreateAnnouncement": CreateAnnouncement,
    "EditAnnouncement": EditAnnouncement,
    "TestResults": TestResults,
    "AssignmentResults": AssignmentResults,
}

export const pagesConfig = {
    mainPage: "AuthRedirect",
    Pages: PAGES,
};