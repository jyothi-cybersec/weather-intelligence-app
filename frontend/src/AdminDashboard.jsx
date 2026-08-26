import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function AdminDashboard({ token, onLogout }) {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSearches = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/searches`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load searches.");
        }

        setSearches(data.searches || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadSearches();
  }, [token]);

  const uniqueLocations = new Set(
    searches.map((search) => search.location)
  ).size;

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow">PRIVATE AREA</p>
          <h1>Owner Dashboard</h1>
          <p>Weather Intelligence search analytics</p>
        </div>

        <button onClick={onLogout}>Logout</button>
      </div>

      {loading && <p>Loading search data...</p>}

      {error && <div className="error">{error}</div>}

      {!loading && !error && (
        <>
          <section className="admin-stats">
            <div className="admin-stat">
              <span>Total Searches</span>
              <strong>{searches.length}</strong>
            </div>

            <div className="admin-stat">
              <span>Unique Locations</span>
              <strong>{uniqueLocations}</strong>
            </div>

            <div className="admin-stat">
              <span>Latest Search</span>
              <strong>
                {searches.length > 0
                  ? searches[0].location
                  : "None"}
              </strong>
            </div>
          </section>

          <section className="search-history">
            <h2>Search Backup</h2>

            {searches.length === 0 ? (
              <p>No searches have been stored yet.</p>
            ) : (
              <div className="search-list">
                {searches.map((search) => (
                  <article
                    className="search-record"
                    key={search.id}
                  >
                    <div>
                      <h3>{search.location}</h3>

                      <p>
                        {search.start_date} → {search.end_date}
                      </p>

                      <small>
                        Search ID: #{search.id}
                      </small>
                    </div>

                    <div className="search-time">
                      {search.created_at}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default AdminDashboard;