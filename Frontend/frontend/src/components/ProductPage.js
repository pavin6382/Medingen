// src/components/ProductPage.js
import React, { useEffect, useState } from "react";
import { getAllProducts, getProductDetails, addSalt } from "../api";
import "../App.css";

export default function ProductPage({ productId = 1 }) {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const [newSalt, setNewSalt] = useState({ salt_name: "", strength: "" });
  const [addingSalt, setAddingSalt] = useState(false);
  const [msg, setMsg] = useState("");

  // Example image URLs (unsplash / public images)
  const heroImg = "https://images.unsplash.com/photo-1580281657527-47b29b39c3a3?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=9c6a4f4f5e2b1a6d5f4f5f6c7d8a9b0c";
  const altImage = "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=5f3e8a2b6b6d7e5f6a9b0c1d2e3f4a5b";

  useEffect(() => {
    async function loadAll() {
      const p = await getAllProducts();
      setProducts(p);
      const details = await getProductDetails(productId);
      setSelected(details);
      setLoading(false);
    }
    loadAll();
  }, [productId]);

  const handleSelect = async (id) => {
    setLoading(true);
    const details = await getProductDetails(id);
    setSelected(details);
    setLoading(false);
  };

  const handleAddSalt = async () => {
    if (!newSalt.salt_name || !newSalt.strength) {
      setMsg("Enter salt name & strength");
      return;
    }
    setAddingSalt(true);
    const res = await addSalt(selected.product.id, newSalt);
    if (res && res.insertId) {
      setSelected((s) => ({
        ...s,
        salts: [...(s.salts || []), { id: res.insertId, ...newSalt }],
      }));
      setNewSalt({ salt_name: "", strength: "" });
      setMsg("Added");
    } else {
      setMsg(res?.error || "Failed to add");
    }
    setAddingSalt(false);
    setTimeout(() => setMsg(""), 2000);
  };

  if (loading) return <div className="container"><h3>Loading…</h3></div>;

  return (
    <div className="container">
      <header className="app-header">
        <div className="logo">Medingen</div>
        <div className="app-sub">Medicine details</div>
      </header>

      <div className="product-grid">
        <div className="product-details">
          <div className="card">
            <div className="breadcrumb">&lt; Paracetamol/acetaminophen</div>

            <div className="hero" style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <img src={heroImg} alt="medicine" className="hero-img" />
              <div>
                <h2 className="page-title">{selected?.product?.name}</h2>
                <div className="muted">{selected?.product?.brand}</div>
              </div>
            </div>

            <div className="two-cols" style={{ marginTop: 12 }}>
              <div className="left-col">
                <section className="section">
                  <h3>Medicine Details</h3>
                  <p className="muted">{selected?.product?.description}</p>
                </section>

                <section className="section">
                  <h4>Uses</h4>
                  <p className="muted">Used for fever, pain relief and more (sample text).</p>
                </section>

                <section className="section">
                  <h4>How it Works</h4>
                  <p className="muted">Information about dosage & mechanism (sample text).</p>
                </section>

                <section className="section">
                  <h4>Side Effects</h4>
                  <ul>
                    <li>Diarrhea</li>
                    <li>Stomach upset</li>
                    <li>Nausea</li>
                  </ul>
                </section>
              </div>

              <div className="right-col">
                <div className="card small">
                  <h4>Generic Medicine Alternative</h4>
                  {products.slice(0, 4).map((alt) => (
                    <div key={alt.id} className="alt-row">
                      <div className="alt-thumb">
                        <img alt={alt.name} src={altImage} />
                      </div>
                      <div className="alt-meta">
                        <strong>{alt.name}</strong>
                        <div className="muted small">{alt.brand}</div>
                      </div>
                      <div className="alt-action">
                        <button className="btn-outline">+ Add</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card small" style={{ marginTop: 12 }}>
                  <h4>Compare medicine</h4>
                  <div className="compare-grid">
                    {products.slice(0, 4).map((p) => (
                      <div key={p.id} className="compare-card">
                        <img src="https://images.unsplash.com/photo-1580281657527-47b29b39c3a3?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=9c6a4f4f5e2b1a6d5f4f5f6c7d8a9b0c" alt={p.name} />
                        <div className="compare-title">{p.name}</div>
                        <div className="muted small">{p.brand}</div>
                        <div className="price">Rs. 34</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <section className="section">
              <h4>Frequently asked questions</h4>
              <div className="faq">
                <details>
                  <summary>What if I vomit after taking Paracetamol?</summary>
                  <p className="muted">If vomit within 30 minutes, take again. (sample)</p>
                </details>
                <details>
                  <summary>How often can I take?</summary>
                  <p className="muted">Follow the instructions. (sample)</p>
                </details>
              </div>
            </section>

            <section className="section">
              <h4>Ratings & Review</h4>
              <div className="review">
                <div className="stars">★★★★★</div>
                <p className="muted">"the medicine is good..."</p>
              </div>
            </section>

            <section className="section muted small">
              <b>Disclaimer:</b> The content here is for informational purposes only...
            </section>
          </div>
        </div>

        <div className="product-list">
          <div className="card">
            <h4>All Products</h4>
            <ul className="list">
              {products.map((p) => (
                <li key={p.id} className="product-card" onClick={() => handleSelect(p.id)}>
                  <div>
                    <strong>{p.name}</strong>
                    <div className="muted small">{p.brand}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="card" style={{ marginTop: 12 }}>
            <h4>Salt composition</h4>
            <div className="salt-list">
              {selected?.salts?.length === 0 ? <p className="muted">No salts</p> : (
                <ul>
                  {selected.salts.map((s) => (
                    <li key={s.id}>{s.salt_name} — {s.strength}</li>
                  ))}
                </ul>
              )}
            </div>

            <h5 style={{ marginTop: 10 }}>Add new salt</h5>
            <input placeholder="Salt name" value={newSalt.salt_name}
                   onChange={(e) => setNewSalt({ ...newSalt, salt_name: e.target.value })} />
            <input placeholder="Strength (e.g. 500mg)" value={newSalt.strength}
                   onChange={(e) => setNewSalt({ ...newSalt, strength: e.target.value })} />
            <button onClick={handleAddSalt} disabled={addingSalt}>
              {addingSalt ? "Adding..." : "Add Salt"}
            </button>
            <div className="muted small">{msg}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
