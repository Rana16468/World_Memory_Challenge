import { createBrowserRouter } from "react-router-dom";
import Main from "../layout/Main";
import Home from "../Home/Home";
import Contract from "../contrcat/Contract";
import PDFVoiceRecorder from "../PDFVoiceRecorder/PDFVoiceRecorder";
import WordGame from "../../WordGame/WordGame";
import DictionaryApp from "../DictionaryApp/DictionaryApp";
import DictionaryDetails from "../DictionaryDeatils/DictionaryDetails";
import About from "../About/About";
import TextVoiceRecorder from "../TextVoiceRecorder/TextVoiceRecorder";
import EnglishBanglaConverter from "../EnglishBanglaConverter/EnglishBanglaConverter";
import PdfConverter from "../Pdf/PdfConverter";
import AdvancedGame from "../../WordGame/AdvancedGame";
import WebsiteValidator from "../WebsiteValidator/WebsiteValidator";
import CountryMemoryGame from "../CountryMemoryGame/CountryMemoryGame";
import VideoRecordingSystem from "../VideoRecordingSystem/VideoRecordingSystem";
import DynamicNeuroverse from "../DynamicNeuroverse/DynamicNeuroverse";
import RocketLaunchSimulator from "../DynamicNeuroverse/RocketLaunchSimulator";
import ReactionTimeBlitz from "../ReactionTimeBlitz/ReactionTimeBlitz"
import CryptoPortfolioAnalyzer from "../CryptoPortfolioAnalyzer/CryptoPortfolioAnalyzer";
import Login from "../Login/Login";


const router = createBrowserRouter([
  {
    path: "/",
    element: <Main />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/contract",
        element: <Contract />,
      },

      {
        path: "/pdf_voice_recorder",
        element: <PDFVoiceRecorder />,
      },
      {
        path: "/game_zone",
        element: <WordGame />,
      },
      {
        path: "/advanced_game",
        element: <AdvancedGame />,
      },
      {
        path: "/dictionary_app",
        element: <DictionaryApp />,
      },
      {
        path: "/dictionary_details/:search",
        element: <DictionaryDetails />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/text_voice_recorder",
        element: <TextVoiceRecorder />,
      },
      {
        path: "/convater",
        element: <EnglishBanglaConverter />,
      },
      {
        path: "/pdf_convater",
        element: <PdfConverter />,
      },
      {
        path: "/website_validator",
        element: <WebsiteValidator />,
      },
      {
        path: "/country_memory_game",
        element: <CountryMemoryGame />,
      },
      {
        path: "/video_recording_system",
        element: <VideoRecordingSystem />,
      },
      {
        path: "/dynamic_neuroverse",
        element: <DynamicNeuroverse />,
      },
      { path: "/rocket_launch_simulator", element: <RocketLaunchSimulator /> },
      {path:"/reaction_time_blitz", element:<ReactionTimeBlitz/>},
      {path:"/mind_mirror", element:< CryptoPortfolioAnalyzer/>},
      {path:"/login", element:<Login/>}
    ],
  },
]);

export default router;
// https://www.apicountries.com/countries
