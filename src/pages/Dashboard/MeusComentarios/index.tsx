import iziToast from "izitoast";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { IComentario } from "../../../interfaces/IComentario";
import { IUsuario } from "../../../interfaces/IUsuario";
import {
  deleteComment,
  getComments,
  getCommentsByUserId,
} from "../../../services/comentarioService";
import { getItem } from "../../../services/localStorageService";
import { IPostagem } from "../../../interfaces/IPostagem";
import { getPostById } from "../../../services/postagemService";

interface IPostagemEComentario {
  post: IPostagem;
  comment: IComentario;
}

export default function MeusComentarios() {
  const [postsAndComments, setPostsAndComments] = useState<
    IPostagemEComentario[]
  >([]);
  const [loggedUser] = useState<IUsuario>(getItem("loggedUser"));
  const location = useLocation();

  const getCommentsById = async () => {
    const commentsResponse =
      loggedUser.nivel === "ADM"
        ? await getComments()
        : await getCommentsByUserId(loggedUser.id);

    let postIds = commentsResponse.map((cm) => cm.idPostagemFk);

    if (postIds.length > 0) {
      postIds = postIds.filter(
        (item, index) => postIds.indexOf(item) === index
      );
      const postsResponse = await getPostById(postIds);

      const commentAndLike = commentsResponse.map((comment) => {
        const post = postsResponse.find(
          (post) => post.id === comment.idPostagemFk
        ) as IPostagem;

        return {
          comment,
          post,
        };
      });

      setPostsAndComments(commentAndLike);
    } else {
      setPostsAndComments([]);
    }
  };

  const handleDeleteComment = async (id: number) => {
    iziToast.question({
      timeout: 10000,
      close: true,
      overlay: true,
      zindex: 999,
      message: "Deseja realmente excluir esse comentário?",
      position: "center",
      buttons: [
        [
          "<button><b>Não</b></button>",
          (instance, toast) => {
            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
          },
          true,
        ],
        [
          "<button>Sim</button>",
          async (instance, toast) => {
            instance.hide({ transitionOut: "fadeOut" }, toast, "button");
            const success = await deleteComment(id);

            if (success) {
              getCommentsById();

              iziToast.success({
                position: "bottomCenter",
                message: "Comentário excluído",
              });
            } else {
              iziToast.error({
                position: "bottomCenter",
                message: "Erro ao excluir comentário",
              });
            }
          },
          false,
        ],
      ],
    });
  };

  useEffect(() => {
    getCommentsById();
  }, [location]);

  return (
    <>
      <h1 className="display-5 fw-bold mb-5">Meus comentários</h1>
      <div className="row">
        {postsAndComments.length > 0 ? (
          postsAndComments.map((pc) => (
            <div className="col-4 mb-4" key={pc.comment.id}>
              <div className="card">
                <div className="card-body">
                  <p>
                    <Link
                      to={`/postagens/${pc.post.id}`}
                      target="_blank"
                      className="text-dark fw-bold"
                    >
                      {pc.post.titulo}
                    </Link>
                  </p>
                  {pc.comment.conteudo}
                </div>
                <div className="card-footer text-muted">
                  <button
                    className="btn btn-outline-danger me-1"
                    onClick={() => handleDeleteComment(pc.comment.id)}
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Nenhum comentário foi feito ainda</p>
        )}
      </div>
    </>
  );
}
