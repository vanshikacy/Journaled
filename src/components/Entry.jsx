import { db } from "../firebase/firebase";
import {collection, addDoc, serverTimestamp, doc, updateDoc} from "firebase/firestore";
import {useState, useEffect} from "react";
import { auth } from '../firebase/firebase'; 


export default function Entry({onClose, currentEntry, fetchEntries}){

    const [title, setTitle] = useState("");
    const [mood, setMood] = useState("");
    const [content, setContent] = useState("");

    useEffect(()=>{
        if(currentEntry){
            setTitle(currentEntry.title);
            setMood(currentEntry.mood);
            setContent(currentEntry.content);
        }

    }, [currentEntry]);

   const handleSubmit = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to add an entry!");
      return;
    }

    try {
      if (currentEntry?.id) {
        // update existing entry
        const docRef = doc(db, "entries", currentEntry.id);
        await updateDoc(docRef, {
          title,
          mood,
          content,
          updatedAt: serverTimestamp()
        });
        alert("Entry updated!");
      } else {
        // add new entry
        await addDoc(collection(db, "entries"), {
          title,
          mood,
          content,
          uid: user.uid,
          createdAt: serverTimestamp()
        });
        alert("Entry saved!");
      }

      // clear form
      setTitle("");
      setMood("");
      setContent("");

      if (typeof fetchEntries === "function") fetchEntries();
      if(typeof onClose==="function") onClose();
    } catch (err) {
      console.error("Failed to save/update entry", err.message);
      alert("Something went wrong: " + err.message);
    }
  };

  const [startDate, setStartDate] =useState(null);
  useEffect(()=>{
    setStartDate(new Date())}, []);
  
    return (
        <div>
        <form id="entryform" onSubmit={handleSubmit}>
            <p id="date">{startDate ? startDate.toLocaleDateString() : "New Entry"}</p>
            <input type="text" placeholder="How are we feeling today?" 
            value={title}
            onChange={(e)=> setTitle(e.target.value)} 
            required/>
           <div id="moods">
                   <button
                   type="button"
                   className={mood === "laugh" ? "selected" : ""}
                    onClick={() => setMood("laugh")}
                    >
                  <i className="fa-solid fa-face-laugh-squint"></i>
                    </button>

                    <button
                    type="button"
                   className={mood === "wink" ? "selected" : ""}
                    onClick={() => setMood("wink")}
                       >
                  <i className="fa-solid fa-face-smile-wink"></i>
                   </button>

                    <button
                    type="button"
                     className={mood === "smile" ? "selected" : ""}
                     onClick={() => setMood("smile")}
                      >
                     <i className="fa-solid fa-face-smile"></i>
                    </button>

                     <button
                     type="button"
                     className={mood === "meh" ? "selected" : ""}
                      onClick={() => setMood("meh")}
                       >
                   <i className="fa-solid fa-face-meh"></i>
                    </button>

                      <button
                    type="button"
                    className={mood === "angry" ? "selected" : ""}
                     onClick={() => setMood("angry")}
                      >
                     <i className="fa-solid fa-face-angry"></i>
                      </button>

                       <button
                    type="button"
                      className={mood === "sad" ? "selected" : ""}
                        onClick={() => setMood("sad")}
                        >
                   <i className="fa-solid fa-face-sad-tear"></i>
                     </button>

                          <button
                      type="button"
                     className={mood === "cry" ? "selected" : ""}
                       onClick={() => setMood("cry")}
                          >
                       <i className="fa-solid fa-face-sad-cry"></i>
                      </button>
                     </div>

            <textarea
            placeholder="Just let it out..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            ></textarea>
                <button type="submit">Save Entry</button>
            
        </form>
        </div>
    )
}