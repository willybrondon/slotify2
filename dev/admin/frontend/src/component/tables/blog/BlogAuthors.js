import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Title from "../../extras/Title";
import Button from "../../extras/Button";
import ToggleSwitch from "../../extras/ToggleSwitch";
import {
  createBlogAuthor,
  deleteBlogAuthor,
  getBlogAuthors,
  updateBlogAuthor,
} from "../../../redux/slice/blogSlice";
import { warning } from "../../../util/Alert";
import { SKEDISY_ADMIN_UI as ui } from "../../../constants/skedisyUiCopy";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  bio: "",
  isActive: true,
};

const BlogAuthors = () => {
  const dispatch = useDispatch();
  const { authors, isLoading } = useSelector((s) => s.blog);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    dispatch(getBlogAuthors());
  }, [dispatch]);

  const startEdit = (a) => {
    setEditId(a._id);
    setForm({
      name: a.name || "",
      email: a.email || "",
      password: "",
      bio: a.bio || "",
      isActive: a.isActive !== false,
    });
  };

  const reset = () => {
    setEditId(null);
    setForm(emptyForm);
  };

  const save = () => {
    if (!form.email || (!editId && !form.password)) {
      return;
    }
    if (editId) {
      const payload = {
        id: editId,
        name: form.name,
        email: form.email,
        bio: form.bio,
        isActive: form.isActive,
      };
      if (form.password.trim()) payload.password = form.password.trim();
      dispatch(updateBlogAuthor(payload)).then(() => {
        reset();
        dispatch(getBlogAuthors());
      });
    } else {
      dispatch(createBlogAuthor(form)).then(() => {
        reset();
        dispatch(getBlogAuthors());
      });
    }
  };

  const handleDelete = async (id) => {
    const data = await warning("Désactiver cet auteur blog ?");
    if (data?.isConfirmed) {
      dispatch(deleteBlogAuthor(id)).then(() => dispatch(getBlogAuthors()));
    }
  };

  const toggleActive = (a) => {
    dispatch(
      updateBlogAuthor({
        id: a._id,
        isActive: !a.isActive,
      })
    ).then(() => dispatch(getBlogAuthors()));
  };

  return (
    <div className="mainAdminContent">
      <Title name={ui.nav.blogAuthors || "Auteurs blog"} />
      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card p-3">
            <h5 className="mb-3">{editId ? "Modifier l'auteur" : "Nouvel auteur"}</h5>
            <div className="mb-2">
              <label className="form-label">Nom</label>
              <input
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Email</label>
              <input
                className="form-control"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">
                Mot de passe {editId ? "(laisser vide pour ne pas changer)" : ""}
              </label>
              <input
                className="form-control"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label">Bio</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="d-flex gap-2 mt-3">
              <Button
                text={editId ? "Enregistrer" : "Créer l'accès"}
                className="bg-theme text-light"
                onClick={save}
              />
              {editId ? (
                <Button text="Annuler" className="btn-secondary" onClick={reset} />
              ) : null}
            </div>
            <p className="text-muted small mt-3 mb-0">
              L'auteur se connecte sur{" "}
              <a href="/blogadmin/" target="_blank" rel="noreferrer">
                /blogadmin/
              </a>
            </p>
          </div>
        </div>
        <div className="col-lg-8">
          <div className="card p-3">
            {isLoading ? <p>Chargement…</p> : null}
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Actif</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {(authors || []).map((a) => (
                    <tr key={a._id}>
                      <td>{a.name}</td>
                      <td>{a.email}</td>
                      <td>
                        <ToggleSwitch
                          value={a.isActive}
                          onClick={() => toggleActive(a)}
                        />
                      </td>
                      <td className="text-end">
                        <Button
                          text="Modifier"
                          className="btn-sm me-2"
                          onClick={() => startEdit(a)}
                        />
                        <Button
                          text="Désactiver"
                          className="btn-sm btn-danger"
                          onClick={() => handleDelete(a._id)}
                        />
                      </td>
                    </tr>
                  ))}
                  {!authors?.length && !isLoading ? (
                    <tr>
                      <td colSpan={4} className="text-muted">
                        Aucun auteur. Créez un accès email / mot de passe.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogAuthors;
