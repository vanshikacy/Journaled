import Entry from "./Entry.jsx"
import {useState, useEffect} from 'react';
import Modal from './Modal';
import { db } from "../firebase/firebase";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, query, where, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore";

export default function Layout({children}){

    const [isEntryOpen, setEntryOpen] =useState(false);
    const [user, setUser] = useState(null);
    const [entries, setEntries] = useState([]);
    const [selectedEntry, setSelectedEntry]=useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      fetchEntries(currentUser.uid);
    } else {
      setUser(null);
      setEntries([]);
    }
  });

  return () => unsubscribe(); 
}, []);

const fetchEntries= async(uid)=>{
    const q=query(
        collection(db, "entries"),
        where("uid", "==", uid),
        orderBy("createdAt", "desc")
    );

    try{
        const snapshot=await getDocs(q);
        const data=snapshot.docs.map(doc=>({
            id: doc.id,
            ...doc.data()
        }))
        setEntries(data);
    } catch(err){
        console.error("Failed to ftch entries", err.message);
        alert("Could not load entries: "+ err.message);
    }
}

    const toggleTheme=()=>{
        const currentTheme=document.body.getAttribute('data-theme');
        const newTheme=currentTheme==='dark'?'light':'dark';
        document.body.setAttribute('data-theme', newTheme);
    }

    const handleGoogleLogin=async()=>{
        try{
            const provider = new GoogleAuthProvider();
           const result = await signInWithPopup(auth, provider); 
            const user = result.user;}
            catch (err){
                console.error("Login error:", err.message);
                alert("Failed to login"+ err.message);
            
        }
    }
  
    return (
        <>
        <header>
            <div id="headercontainer">
                <h1>Journaled</h1>
                <div id="headerbuttons">
                {user ? (<p id="welcome">Welcome,<br />{user.displayName}</p>
                 ) : (
               <button onClick={handleGoogleLogin}>Sign In</button>
               )}
                <button  id="darkmode" onClick={toggleTheme}><i class="fa-solid fa-circle-half-stroke"></i></button></div>
            </div>
        </header>
        <main>
            <div id="mainheader">
            <button id="newentry" onClick={()=>setEntryOpen(true)}>New Entry</button>

            <input type="text" placeholder="Search by Title"
            value={searchQuery}
            onChange={(e)=> setSearchQuery(e.target.value)}></input></div>

            <div id="entrylist">
             {entries.length === 0 ? (
             <p>No entries yet. Go write something beautiful :) </p>
               ) : (
              entries.filter(entry=>
                entry.title?.toLowerCase().includes(searchQuery.toLowerCase())
              ).map(entry => (
             <button id="entry" key={entry.id}
              onClick={() => {
              setSelectedEntry(entry);
            setEntryOpen(true);
              }}>
             <p>{entry.title}</p>
             <div id="right">
            <p id="date">{new Date(entry.createdAt?.seconds * 1000).toLocaleDateString()}</p>
              
              
              <button id="deletebtn"
                 onClick={async (e) => {
                 e.stopPropagation(); 
                 try {
                 await deleteDoc(doc(db, "entries", entry.id));
                 alert("Entry deleted!");
                 fetchEntries(user.uid);
                } catch (err) {
                 console.error("Delete error", err.message);
                 alert("Failed to delete entry: " + err.message);
                   }
                  }}
                 >
                 <i className="fa-solid fa-trash"></i>
               </button>

            </div>
           </button>
            ))
              )}
        </div>

            
        </main>


        {/* {entry modal} */}
        <Modal isOpen={isEntryOpen} onClose={()=>setEntryOpen(false)}>
            <Entry  onClose={() => {
      setEntryOpen(false);
      setSelectedEntry(null);
            }}
         currentEntry={selectedEntry}
         fetchEntries={() => fetchEntries(user.uid)}
            />
        </Modal>
        <footer>
            By <a href="https://vanshikacy.github.io/web-portfolio/" target="/blank">Vanshika Choudhary</a> ⭐ the repo on <a href="/"> GitHub </a> :)
        </footer>
        </>
    )
}