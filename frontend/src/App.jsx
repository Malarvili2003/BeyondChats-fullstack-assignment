import { useEffect, useState } from "react";
import { getArticles } from "./services/api";
import ArticleCard from "./components/ArticleCard";

function App() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    getArticles().then(setArticles);
  }, []);

  return (
    <div>
      <h1>BeyondChats Articles</h1>
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export default App;
