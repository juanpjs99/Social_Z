import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function PostTweetScreen() {
  const [tweet, setTweet] = useState('');

  const handlePost = () => {
    console.log('Tweet publicado:', tweet);
    setTweet('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nuevo Tweet</Text>
      <TextInput
        style={styles.textArea}
        placeholder="¿Qué estás pensando?"
        multiline
        numberOfLines={4}
        value={tweet}
        onChangeText={setTweet}
      />
      <Button title="Publicar" onPress={handlePost} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, marginBottom: 10 },
  textArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, minHeight: 100, marginBottom: 10 },
});
