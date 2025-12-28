import AITestReview from './pages/AITestReview';
import AssignmentResults from './pages/AssignmentResults';
import AuthRedirect from './pages/AuthRedirect';
import ChatRoom from './pages/ChatRoom';
import CreateAnnouncement from './pages/CreateAnnouncement';
import CreateAssignment from './pages/CreateAssignment';
import CreateRoom from './pages/CreateRoom';
import CreateTest from './pages/CreateTest';
import DirectMessages from './pages/DirectMessages';
import EditAnnouncement from './pages/EditAnnouncement';
import EditAssignment from './pages/EditAssignment';
import EditTest from './pages/EditTest';
import FlashSprint from './pages/FlashSprint';
import Home from './pages/Home';
import JoinRoom from './pages/JoinRoom';
import ManageRooms from './pages/ManageRooms';
import ManageStudents from './pages/ManageStudents';
import OrbitRooms from './pages/OrbitRooms';
import Orvit from './pages/Orvit';
import RoomDetail from './pages/RoomDetail';
import StudentDashboard from './pages/StudentDashboard';
import StudentHistory from './pages/StudentHistory';
import StudentRoom from './pages/StudentRoom';
import StudentVerification from './pages/StudentVerification';
import SuperAdmin from './pages/SuperAdmin';
import TakeAssignment from './pages/TakeAssignment';
import TakeTest from './pages/TakeTest';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherHelp from './pages/TeacherHelp';
import TestResults from './pages/TestResults';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AITestReview": AITestReview,
    "AssignmentResults": AssignmentResults,
    "AuthRedirect": AuthRedirect,
    "ChatRoom": ChatRoom,
    "CreateAnnouncement": CreateAnnouncement,
    "CreateAssignment": CreateAssignment,
    "CreateRoom": CreateRoom,
    "CreateTest": CreateTest,
    "DirectMessages": DirectMessages,
    "EditAnnouncement": EditAnnouncement,
    "EditAssignment": EditAssignment,
    "EditTest": EditTest,
    "FlashSprint": FlashSprint,
    "Home": Home,
    "JoinRoom": JoinRoom,
    "ManageRooms": ManageRooms,
    "ManageStudents": ManageStudents,
    "OrbitRooms": OrbitRooms,
    "Orvit": Orvit,
    "RoomDetail": RoomDetail,
    "StudentDashboard": StudentDashboard,
    "StudentHistory": StudentHistory,
    "StudentRoom": StudentRoom,
    "StudentVerification": StudentVerification,
    "SuperAdmin": SuperAdmin,
    "TakeAssignment": TakeAssignment,
    "TakeTest": TakeTest,
    "TeacherDashboard": TeacherDashboard,
    "TeacherHelp": TeacherHelp,
    "TestResults": TestResults,
}

export const pagesConfig = {
    mainPage: "AuthRedirect",
    Pages: PAGES,
    Layout: __Layout,
};