import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IRoute } from "../../interfaces/IRoutes";
import { IUsuario } from "../../interfaces/IUsuario";
import { getItem, removeItem } from "../../services/localStorageService";

interface IProps {
  children: React.ReactNode;
}

export default function Sidebar({ children }: IProps) {
  const [routesToHideMenu] = useState<string[]>(["/dashboard"]);
  const [activeRoute, setActiveRoute] = useState<string>("");
  const [loggedUser] = useState<IUsuario>(getItem("loggedUser"));
  const location = useLocation();
  const navigate = useNavigate();
  const [routes] = useState<IRoute[]>([
    {
      label:
        loggedUser.nivel === "ADM" ? "Todas postagens" : "Minhas postagens",
      route: "/dashboard/postagens",
      role: ["ADM", "ESC"],
    },
    {
      label: "Todos Usuários",
      route: "/dashboard/usuarios",
      role: ["ADM"],
    },
    {
      label: "Nova postagem",
      route: "/dashboard/postagens/nova",
      role: ["ADM", "ESC"],
    },
    {
      label:
        loggedUser.nivel === "ADM" ? "Todos comentários" : "Meus comentários",
      route: "/dashboard/comentarios",
      role: ["ADM", "ESC", "LEI"],
    },
    {
      label: "Postagens curtidas",
      route: "/dashboard/postagenscurtidas",
      role: ["ADM", "ESC", "LEI"],
    },
    {
      label: "Meus dados",
      route: "/dashboard/meusdados",
      role: ["ADM", "ESC", "LEI"],
    },
  ]);

  const signout = () => {
    removeItem("loggedUser");
    navigate("/");
  };

  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location]);

  useEffect(() => {
    if (loggedUser.nivel === "LEI") {
      navigate("/dashboard/comentarios");
    }
  }, []);

  return (
    <div
      className={`container-fluid ${
        routesToHideMenu.some((route) => activeRoute.includes(route))
          ? ""
          : "d-none"
      }`}
    >
      <div className="row flex-nowrap">
        <div className="col-2 bg-body-tertiary border-end border-warning border-2 border-opacity-50 vh-100">
          <div className="d-flex flex-column p-3 h-100">
            <div className="text-center w-100">
              <Link
                to="/"
                className="fw-bold fs-2 text-warning text-decoration-none"
              >
                News.blog
              </Link>
            </div>
            <ul className="nav nav-pills flex-column h-100">
              {routes.map(({ route, label, role }, index) => (
                <React.Fragment key={index}>
                  {role?.includes(loggedUser.nivel) && (
                    <li className="nav-item">
                      <Link
                        className={`nav-link link-body-emphasis ${
                          activeRoute === route && "fw-bold"
                        }`}
                        to={route}
                      >
                        {label}
                      </Link>
                    </li>
                  )}
                </React.Fragment>
              ))}
              <li className="mt-auto pt-2">
                <button
                  onClick={signout}
                  className="nav-link link-body-emphasis"
                >
                  <i className="fa-solid fa-right-from-bracket me-2"></i> Sair
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="col-10 p-5 overflow-auto vh-100">{children}</div>
      </div>
    </div>
  );
}
