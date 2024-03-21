import React, { useEffect, useState } from 'react';
import { AuthContext, useAuthContext } from '../../contexts/AuthContext';
import { Container, Row, Col, Modal, Form, Card, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LessonAPI } from './api';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BsFillPlayFill } from 'react-icons/bs';
import { Button } from 'react-bootstrap';
import ReactPlayer from 'react-player'
import { toast } from 'react-toastify';
import { UserTools } from '../../tools/user'
import QuestionCourse from '../../components/QuestionCourse/question_course';
import { HiDownload, HiOutlineExternalLink } from "react-icons/hi"
import Navbar from 'react-bootstrap/Navbar'
import Avatar from 'react-avatar'
import './styles.css'
import { AUTH_DEBUG, BASE_URL, HttpResponse, HttpStatus } from '../../api/default';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faShare } from '@fortawesome/free-solid-svg-icons';
import CardAnotation from '../../components/Note/CardAnotation';

const DEFAULT_VIDEO_PLAYER_STATE = {
  playing: false,
  started: false,
  played: 0,
  duration: 0,
  completed: false,
  progress: 0
}

export const StudentLessonPage = () => {

  const { id } = useParams();
  const [lesson, setLesson] = React.useState()
  const [controle, setControle] = React.useState({ enrolled: undefined })
  const [videoPlayer, setVideoPlayer] = React.useState(DEFAULT_VIDEO_PLAYER_STATE);
  const [videoDuration, setVideoDuration] = React.useState(null);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  const { user, refreshUserOnContext, token, logged } = useAuthContext();
  const [userData, setUserData] = useState();

  const notifySuccess = (texto) => toast.success(texto, {
    position: "top-right",
    autoClose: 4500,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });

  const notifyError = (texto) => toast.error(texto, {
    position: "top-right",
    autoClose: 3500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
  });

  const navigate = useNavigate();


  React.useEffect(() => {
    if(user){
      setUserData(user)
    }
    if (lesson && lesson.users_who_completed && user)
      if (lesson.users_who_completed.includes(user.id) && lesson.professor !== user.id)
        setVideoPlayer({ ...videoPlayer, completed: true })
  }, [lesson, user])

  React.useEffect(() => {

    const verifyPermissions = async (courseId) => {
      const response = await LessonAPI.getCourse(lesson.course);
      const course = response.data;
      const isEnrolled = course.students.map(c => c.id).includes(user.id)
      setControle({ enrolled: isEnrolled })
    }

    if (lesson && lesson.id) {
      verifyPermissions(lesson.course)
    }
  }, [lesson])

  const isProfessorOfLessonCourse = () => user && lesson && lesson.professor && (lesson.professor === user.id);
  const completeStudentLesson = async () => {
    await LessonAPI.completeLessonAsStudent(user.id, lesson.id);
    setVideoPlayer({ ...videoPlayer, completed: true })
    await checkStudentLessonProgress();
  }

  const refreshLesson = async () => {
    const response = await LessonAPI.getLesson(id);
    setLesson(response.data);
  }

  const checkStudentLessonProgress = async () => {
    const courseInfoFromUserEnrolledCourse = UserTools.getEnrolledCourseFromUser(user, lesson.course ?? -1);

    if (courseInfoFromUserEnrolledCourse.lessons_completed >= courseInfoFromUserEnrolledCourse.total_lessons - 1)
      notifySuccess("Parabéns, você concluiu o curso, certificado disponibilizado!")
    else notifySuccess("Parabéns, você concluiu a aula!")

    await refreshLesson()
    refreshUserOnContext()
  }

  React.useEffect(() => {
    setVideoPlayer(DEFAULT_VIDEO_PLAYER_STATE)
    setVideoDuration(null)

    if (id) refreshLesson();
    if (window) window.scrollTo(0, 0);
    requestNotes();
  }, [id]);

  React.useEffect(() => {
    const completeLesson = async () => {
      if (videoPlayer.played > 0.95 && !videoPlayer.completed && !isProfessorOfLessonCourse()) {
        await completeStudentLesson()
      }
    }

    completeLesson()

  }, [videoPlayer])

  const handleVideoOnPlay = () => {
    if (!controle.enrolled && !isProfessorOfLessonCourse()) {
      notifyError("Você precisa matricular-se no curso para assistir as aula!")
      setVideoPlayer({ ...videoPlayer, playing: false, started: false, played: false })
    } else {
      setVideoPlayer({ ...videoPlayer, playing: true, started: true, played: false })
    }
  }

  const handleOnProgress = ({ played, playedSeconds }) => {
    //console.log(playedSeconds)
    if (controle.enrolled) setVideoPlayer({ ...videoPlayer, played, playedSeconds });
  }

  const getTime = (seconds) => {
    //console.log(seconds)
    const m = Math.floor(seconds % 3600 / 60).toString().padStart(2, '0'),
      s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return (seconds == undefined ? "00:00" : m + ':' + s);
  }

  const handleCloseModal = (clear) => { if (clear) setNote(''); setShowModal(false) }
  const handleShowModal = () => { videoPlayer.playing = false; setShowModal(true) };

  const fetchNote = async (time, note) => {
    const url = `${BASE_URL}/anotation/`;
    var errorMessage;
    try {
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'jwt': token,
          Accept: 'application/json'
        },
        body: JSON.stringify({ user: user.id, time: time, note: note, link: "https://www.google.com.br", course: lesson.course, lesson: lesson.id })
      }

      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        AUTH_DEBUG && console.log("AuthAPI::FetchNote(): ", data.token);
        return new HttpResponse(HttpStatus.OK, data);
      } else {
        errorMessage = await response.json();
        throw new Error("Error on FetchNote()");
      }
    } catch (error) {
      console.warn(error)
      return new HttpResponse(HttpStatus.ERROR, errorMessage);
    }
  }

  const fetchAnotations = async () => {
    if(userData){
    //console.log(user.id)
    const url = `${BASE_URL}/anotation/list-notes-lesson/${userData.id}/${id}/`;
    var errorMessage;
    try {
      const options = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'jwt': token,
          Accept: 'application/json'
        }
      }

      const response = await fetch(url, options);
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        AUTH_DEBUG && console.log("AuthAPI::fetchAnotations(): ", data.token);
        return new HttpResponse(HttpStatus.OK, data);
      } else {
        errorMessage = await response.json();
        throw new Error("Error on fetchAnotations()");
      }
    } catch (error) {
      console.warn(error)
      return new HttpResponse(HttpStatus.ERROR, errorMessage);
    }
  }
}

  const requestNotes = async () => {
    const listNotes = await fetchAnotations();
    //console.log(listNotes.data)
    if (listNotes.status !== HttpStatus.OK) {
      notifyError("Falha ao requisitar lista de códigos.");
    }
    setNotes(listNotes.data);
  }


  const handleSubmit = async (e) => {
    handleCloseModal(false)
    e.preventDefault();
    const response = await fetchNote(Math.floor(videoPlayer.playedSeconds), note)
    if (response.status !== HttpStatus.OK) {
      //console.log(response)
      notifyError("Falha ao enviar anotação.")
    } else {
      refreshUserOnContext()
      notifySuccess("Anotação salva.");
      setNote("")
      requestNotes();
      handleCloseModal()
    }
    /* const response = await ProfileAPI.putInvite(user.id, authorizationCode, token);
     //console.log("response: ", response)
 
     if (response.status !== HttpStatus.OK) {
       console.log(response)
       setAuthorizationCode('')
       notifyError("Falha ao alterar permissões.")
     } else {
       refreshUserOnContext()
       notifySuccess("Permissões atualizadas com sucesso. Agora você é um professor :)");
       handleCloseModal()
     }*/
  }



  const fetchDelete = async (noteid) => {
    const url = `${BASE_URL}/anotation/${noteid}/`;
    var errorMessage;
    try {
      const options = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'jwt': token,
          Accept: 'application/json'
        }
      }

      const response = await fetch(url, options);
      console.log("response of", (response.ok == true))
      if (response.ok == true) {
        const data = await response.json();
        AUTH_DEBUG && console.log("AuthAPI::deleteAnotations(): ", data.token);
        return new HttpResponse(HttpStatus.OK, data);
      } else {
        errorMessage = await response.json();
        throw new Error("Error on deleteAnotations()");
      }
    } catch (error) {
      console.warn(error)
      return new HttpResponse(HttpStatus.ERROR, errorMessage);
    }
  }


  const deleteNote = async (noteid) => {
    const response = await fetchDelete(noteid);
    //console.log("Response de baixo",response.status)
    if (response.status == 400) {
      notifySuccess("Nota deletada com sucesso.");
      requestNotes();
    } else {
      notifyError("Falha ao deletar nota.");
    }
  }


  const anotar = () => {
    //console.log("Anotação");
    handleShowModal();
  }

  return lesson ? (
    <>
      {/* {logged && React.createElement("Button", { onClick: () => anotar(), className: 'btn btn-success', style: { position: "absolute", right: "30px", bottom: "50%" } }, "Anotar")} */}
      {/* {console.log(lesson)} */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Faça sua Anotação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Anotação para o tempo: {getTime(videoPlayer.playedSeconds)}</p>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="note">
              <Form.Control as="textarea" rows={5} style={{ resize: 'none' }} autoComplete="off" placeholder="Anotação" value={note} onChange={(e) => setNote(e.target.value)} />
            </Form.Group>
            <Button disabled={note?.length < 3} className='mt-2' variant="success" type="submit">Salvar anotação</Button>
          </Form>
        </Modal.Body>
      </Modal>

      <Container fluid style={{ marginBottom: '1rem' }} className='container-student-lesson-page'>
        <Navbar>
            {logged && user ? (
              <p style={{ color: '#0f5b7a' }} className="mt-3 fs-6 fw-bold">
                &#128075;&nbsp; Hey, {user?.name?.split(' ')[0]}!
              </p>
            ) : (
              <p style={{ color: '#0f5b7a' }} className="mt-3 fs-6 fw-bold">
                &#128075;&nbsp; BEM-VINDO!
              </p>
            )}

            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
              <Navbar.Text>
                {user && user.photo ? <img src={user.photo} style={{ width: '50px', aspectRatio: 1, borderRadius: '50%', objectFit: 'fill', objectPosition: 'center', cursor: 'pointer' }} alt="profile" />
                  : <Avatar
                      name={(user?.name && user?.name.split(' ')[0]) || "O i"}
                      color="#0f5b7a"
                      size={30}
                      textSizeRatio={2}
                      round={true}
                  />}
                {/* {user && (
                  <Avatar
                    name={user.name}
                    color="#0f5b7a"
                    size={30}
                    textSizeRatio={2}
                    round={true}
                  />
                )} */}
              </Navbar.Text>
            </Navbar.Collapse>
          </Navbar>

        <Row className='mt-5'>
          {
            videoPlayer.completed &&
            <Col xs={12} style={{ marginTop: '0.5rem' }}>
              <span className='flag-completed-lesson'>Aula concluída</span>
            </Col>
          }
          {
            isProfessorOfLessonCourse() &&
            <Col xs={12} style={{ marginTop: '0.5rem' }}>
              <span className='flag-is-professor'>Você é o professor desta aula</span>
            </Col>
          }
          <Col xs={12}>
            <h1 style={{ fontWeight: 'bold' }}>{lesson.title}</h1>
          </Col>
          <Col xs={12}>
            {(lesson.banner || lesson.video) && <section style={{ position: 'relative' }}>
              {lesson.banner && (!videoPlayer.started || !lesson.video) && <img src={lesson.banner} style={{ width: '100%', aspectRatio: '16/9', margin: '1rem 0', cursor: 'pointer' }} />}
              {lesson.video && videoPlayer.started && <ReactPlayer url={lesson.video} controls={videoPlayer.playing} className='react-player' playing={videoPlayer.playing} onPlay={handleVideoOnPlay} onProgress={handleOnProgress} /* onPause={handleVideoOnPause} */ config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload'
                  }
                }
              }} />}
              {(!videoPlayer.playing || !lesson.banner) && lesson.video && <BsFillPlayFill onClick={handleVideoOnPlay} style={{ fontSize: '5rem', color: '#0E6216', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', cursor: 'pointer' }} />}
            </section>}
          </Col>
          {logged && controle.enrolled &&
            <Row className='buttons'>
                {
                  <Button className='btn-resources' style={{ marginRight: '1rem', fontWeight: '600', backgroundColor: '#0E6216', borderColor: '#0E6216', borderRadius: '10px', width: '230px', height: '39px'}} onClick={() => anotar()}>Fazer Anotação <FontAwesomeIcon icon={faPen} /></Button>
                }
                {
                  !!lesson.appendix &&
                  <Button className='btn-resources' onClick={() => window.open(lesson.appendix, '_blank')} style={{marginRight: '1rem', fontWeight: '600', backgroundColor: '#0E6216', borderColor: '#0E6216', borderRadius: '10px', width: '230px', height: '39px'}}>Arquivo de apoio <HiDownload style={{ fontSize: '20px' }} /> </Button>
                }
                {
                  !!lesson.extern_appendix_link.trim().length &&
                  <Button className='btn-resources' onClick={() => window.open(lesson.extern_appendix_link, '_blank')} style={{marginRight: '1rem', fontWeight: '600', backgroundColor: '#0E6216', borderColor: '#0E6216', borderRadius: '10px', width: '230px', height: '39px'}}>Material de apoio <HiOutlineExternalLink style={{ fontSize: '20px' }} /> </Button>
                }
                {
                  !lesson.video && !videoPlayer.completed && 
                  <Button className='btn-resources' onClick={completeStudentLesson} style={{marginRight: '1rem', fontWeight: '600', backgroundColor: '#0E6216', borderColor: '#0E6216', borderRadius: '10px', width: '230px', height: '39px'}}>Concluir aula </Button>
                }
            </Row>
          }
          <Col xs={12} style={{ marginTop: '1rem', marginBottom: '1rem' }}>
            <p style={{ textAlign: 'justify' }}>{lesson.content}</p>
          </Col>
          {(controle.enrolled || isProfessorOfLessonCourse()) &&
            <Col xs={12} className="mb-4">
              <QuestionCourse dataLesson={lesson} />
            </Col>
          }
          {logged &&
            <Col xs={12}>
              <section style={{ display: 'flex', justifyContent: 'space-between' }}>
                {lesson.prev && <LinkLesson title={lesson.prev.title} link={`/student/lessons/${lesson.prev.id}`} image={lesson.prev.banner} inverse />}
                <Button className='button-all-lesson' onClick={() => navigate(`/student/courses/${lesson.course}`)}>
                  Ver todas as aulas
                </Button>
                {lesson.next && <LinkLesson title={lesson.next.title} link={`/student/lessons/${lesson.next.id}`} image={lesson.next.banner} />}
              </section>
            </Col>
          }
          {notes && notes.length ?
            <Row>
              <Card
                style={{
                  padding: '16px',
                }}
                className='mt-5'
              >
                <Row className="mb-4">
                  <Col className="d-flex justify-content-between align-items-center">
                    <h1 className="fw-bold fs-5" style={{ color: '#727273' }}>
                      Lista de anotações da aula:
                    </h1>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    {notes.map(note => (
                      <Card key={note.id} className='mt-1'>
                        <Card.Body className='p-1'>
                          <CardAnotation notetime={note.time} notenote={note.note} notedelete={() => deleteNote(note.id)}></CardAnotation>
                          {/* <span className="ms-3">{note.time}</span>
                          <span className="ms-3">{note.note}</span> */}
                        </Card.Body>
                      </Card>
                    ))}
                  </Col>
                </Row>
              </Card>
            </Row> : <></>
          }
        </Row>
      </Container>
    </>
  )
    : logged ? <></> : <h3 className='mt-5 w-100 text-center'>Você precisar realizar login para ver os recursos da aula!</h3>;
}

const LinkLesson = ({ title, link, image, inverse }) => {
  return (
    <Link to={link} style={{ width: '37%' }}>
      <article style={{ position: 'relative', borderRadius: '10px', overflow: 'hidden' }}>
        <img alt='' src={image} style={{ width: '100%', filter: 'brightness(35%)', aspectRatio: '16/8' }} />

        <div style={{ position: 'absolute', color: 'white', left: 0, top: 0, fontWeight: 'bold', textAlign: 'center', maxWidth: '100%', maxHeight: '100%', overflow: 'hidden', padding: '5px' }}>
          {!inverse && <span>Próxima aula</span>}
          {inverse && <span>Aula anterior</span>}
          <br /><br />
          <span>{title}</span>
        </div>
      </article>
    </Link>
  );
}
