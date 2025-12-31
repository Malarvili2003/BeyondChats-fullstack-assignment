import { useEffect, useState } from "react";
import { fetchArticles } from "./services/api";
import ArticleCard from "./components/ArticleCard";
import "./App.css";

function App() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetchArticles().then(res => setArticles(res.data));
  }, []);

  return (
    <div className="container">
      <h1>BeyondChats Articles</h1>
      {articles.map(article => (
        <ArticleCard key={article._id} article={article} />
      ))}
    </div>
  );
}

export default App;
