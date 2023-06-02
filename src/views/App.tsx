import axios from "axios";
import React, { useState } from "react";
import { User, UserProfile } from "../dataTypes";
import dompurify from "dompurify";

export default function App(): JSX.Element {
  const [success, setSuccess] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [wishInput, setWishInput] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const handleSubmit = (ev: any) => {
    ev.preventDefault();
    if (wishInput.length > 100) {
      setWarning("Wish is too long");
      return;
    }
    setUsernameInput("");
    setWishInput("");
    // request to API for data to compare
    axios
      .all([
        axios.get(
          "https://raw.githubusercontent.com/alj-devops/santa-data/master/userProfiles.json"
        ),
        axios.get(
          "https://raw.githubusercontent.com/alj-devops/santa-data/master/users.json"
        ),
      ])
      .then(
        axios.spread((resp1, resp2) => {
          const userProfiles: UserProfile[] = resp1.data;
          const users: User[] = resp2.data;
          const username = dompurify.sanitize(usernameInput);
          const user = users.find((x) => x.username === username);
          // if input username is contained in API
          if (user) {
            const uid = user.uid;
            const profile = userProfiles.find((x) => x.userUid === uid);
            if (profile) {
              const yearsOld =
                new Date().getFullYear() -
                new Date(profile.birthdate).getFullYear();
              if (yearsOld >= 10) {
                setWarning("The user is too old :)");
                return;
              }
              // if user younger than age of 10, building data to send it to the server
              const data = {
                username: username,
                address: profile.address,
                wish: dompurify.sanitize(wishInput),
              };
              // post request with user data
              axios.post("/", data).then((response) => {
                if (response.data.text?.includes(username)) {
                  // if server has sent back email contents properly, show "success" message
                  setSuccess(true);
                }
              });
              setWarning(null);
            } else {
              setWarning("There's no linked profile to this user");
            }
          } else {
            setWarning("There's no such user");
          }
        })
      );
  };
  return (
    <div>
      <header>
        <h1>A letter to Santa</h1>
      </header>
      {!success ? (
        <main>
          <p className="bold">Ho ho ho, what you want for Christmas?</p>

          <form onSubmit={handleSubmit}>
            who are you?
            <input
              name="username"
              placeholder="charlie.brown"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
            />
            what do you want for christmas?
            <textarea
              name="wish"
              rows={10}
              cols={45}
              maxLength={100}
              placeholder="Gifts!"
              value={wishInput}
              onChange={(e) => setWishInput(e.target.value)}
            ></textarea>
            <br />
            <button type="submit" id="submit-letter">
              Send
            </button>
            {
              // if input data would be invalid the respective warning will be shown
              warning && <p className="warning">{warning}</p>
            }
          </form>
        </main>
      ) : (
        // switch to "success" sign
        <div className="success">
          <h2>Complete!</h2>
          <p>Your letter has been successfully sent to Santa</p>
          <a
            onClick={(ev) => {
              ev.preventDefault();
              setSuccess(false);
            }}
          >
            {`\u2190 Back to form`}
          </a>
        </div>
      )}
    </div>
  );
}
