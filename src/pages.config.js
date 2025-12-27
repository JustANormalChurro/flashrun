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
import ManageStudents from './pages/ManageStudents';
import TeacherHelp from './pages/TeacherHelp';
import StudentDashboard from './pages/StudentDashboard';
import JoinRoom from './pages/JoinRoom';
import StudentRoom from './pages/StudentRoom';
import TakeTest from './pages/TakeTest';
import TakeAssignment from './pages/TakeAssignment';
import StudentHistory from './pages/StudentHistory';
import SuperAdmin from './pages/SuperAdmin';
import Home from './pages/Home';
import StudentVerification from './pages/StudentVerification';
import Orvit from './pages/Orvit';
import OrbitRooms from './pages/OrbitRooms';
import __Layout from './Layout.jsx';


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
    "ManageStudents": ManageStudents,
    "TeacherHelp": TeacherHelp,
    "StudentDashboard": StudentDashboard,
    "JoinRoom": JoinRoom,
    "StudentRoom": StudentRoom,
    "TakeTest": TakeTest,
    "TakeAssignment": TakeAssignment,
    "StudentHistory": StudentHistory,
    "SuperAdmin": SuperAdmin,
    "Home": Home,
    "StudentVerification": StudentVerification,
    "Orvit": Orvit,
    "OrbitRooms": OrbitRooms,
}

export const pagesConfig = {
    mainPage: "AuthRedirect",
    Pages: PAGES,
    Layout: __Layout,
};