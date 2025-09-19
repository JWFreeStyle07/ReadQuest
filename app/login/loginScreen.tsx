import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { login, signUp } from "../../firebase/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  async function handleSubmit() {
    try {
      if (isSignUp) {
        await signUp(email, pw, name, grade);
      } else {
        await login(email, pw);
      }
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <View>
      {isSignUp && (
        <>
          <TextInput placeholder="Name" value={name} onChangeText={setName} />
          <TextInput placeholder="Grade Level" value={grade} onChangeText={setGrade} />
        </>
      )}
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={pw} onChangeText={setPw} />
      <Button title={isSignUp ? "Sign Up" : "Login"} onPress={handleSubmit} />
      <Text onPress={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? "Already have an account? Login" : "Don't have an account? Sign Up"}
      </Text>
    </View>
  );
}
