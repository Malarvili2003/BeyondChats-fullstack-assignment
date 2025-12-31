export default function ArticleCard({ article }) {
  return (
    <div className="card">
      <h2>{article.title}</h2>

      <h4>Original Article</h4>
      <p>{article.content?.slice(0, 300)}...</p>

      {article.updatedContent && (
        <>
          <h4>AI Enhanced Version</h4>
          <p className="updated">
            {article.updatedContent.slice(0, 300)}...
          </p>
        </>
      )}

      {article.references?.length > 0 && (
        <>
          <h4>References</h4>
          <ul>
            {article.references.map((ref, index) => (
              <li key={index}>
                <a href={ref} target="_blank" rel="noreferrer">
                  {ref}
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
