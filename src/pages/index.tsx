import { getValue } from "firebase/remote-config";
import { remoteConfig } from "libs/firebase";


export default function Home() {
  const val = getValue(remoteConfig, "isPageEnabled");

  console.log(val);

  return (
    <>
      <h1>Home</h1>
      <p>Welcome to the home page!</p>
      <p>FF: {String(val.asBoolean())}</p>
    </>
  );
}
