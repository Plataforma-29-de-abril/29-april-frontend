/* eslint-disable no-mixed-operators */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import {
  Container,
  Col,
  Row,
  Form,
  Button,
  Alert,
  Spinner,
} from 'react-bootstrap'
import { HttpStatus, CourseAPI } from './api'
import noImage from './no-image.png'
import './style.css'
import { useAuthContext } from '../../contexts/AuthContext'
import { cut } from '../../tools/string'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAdd, faTrash } from '@fortawesome/free-solid-svg-icons'
import Navbar from 'react-bootstrap/Navbar'
import Avatar from 'react-avatar'

const PostFormStatus = {
  ENVIADO: 'ENVIADO',
  ENVIANDO: 'ENVIANDO',
  ERRO: 'ERRO',
  NULL: 'NULL',
}

export const NewCourseScreen = () => {
  const resetValores = () => {
    return {
      title: '',
      description: '',
      files: [],
      content: '',
    }
  }

  const [id, setId] = useState()

  const { logged, user } = useAuthContext()

  const [estado, setEstado] = useState({
    title: undefined,
    description: undefined,
    files: undefined,
    content: undefined,
  })

  const [formValores, setFormValores] = useState(resetValores())
  const [postFormSuccess, setPostFormStatus] = useState(PostFormStatus.NULL)
  const [editable, setEditable] = useState(true)
  const [learnings, setLearnings] = useState([])
  const [learningInput, setLearningInput] = useState('')
  const [allowLearnings, setAllowLearnings] = useState(false)
  const [isLoadingAdd, setIsLoadingAdd] = useState(false)
  const [isLoadingRemove, setIsLoadingRemove] = useState([])

  const navigate = useNavigate()

  useEffect(
    () =>
      setEstado({
        ...estado,
        files: formValores.files.length > 0 ? true : undefined,
      }),
    [formValores.files]
  )

  useEffect(() => {
    refreshLearnings()
  }, [id])

  const setDescription = (e) => {
    setEstado({ ...estado, description: undefined })
    setFormValores({
      ...formValores,
      description: cut(e?.target?.value ?? '', 256),
    })
  }

  const setTitle = (e) => {
    setEstado({ ...estado, title: undefined })
    setFormValores({ ...formValores, title: cut(e?.target?.value ?? '', 64) })
  }

  const setContent = (e) => {
    setEstado({ ...estado, content: undefined })
    setFormValores({
      ...formValores,
      content: cut(e?.target?.value ?? '', 1024),
    })
  }

  const sendForm = async () => {
    var estadoAux = {
      title: formValores.title.trim().length >= 3,
      description: formValores.description.trim().length >= 2,
      files: formValores.files.length > 0,
      content: formValores.content.trim().length >= 3,
    }

    setEstado({ ...estadoAux })

    for (let [, value] of Object.entries(estadoAux)) if (!value) return

    setPostFormStatus(PostFormStatus.ENVIANDO)

    var post = new FormData()

    post.append('title', formValores.title)
    post.append('description', formValores.description)
    post.append('banner', formValores.files[0])
    post.append('content', formValores.content)
    post.append('professor', user.id)

    CourseAPI.registerCourse(post).then((response) => {
      setEditable(false)
      if (response.status === HttpStatus.OK && !!response.data)
        setId(response.data.id)

      setTimeout(() => {
        setPostFormStatus(
          response.status === HttpStatus.OK
            ? PostFormStatus.ENVIADO
            : PostFormStatus.ERRO
        )
        if (response.status === HttpStatus.OK && !!response.data) {
          setAllowLearnings(true)
          setTimeout(() => setPostFormStatus(PostFormStatus.NULL), 5000)
          setEstado({})
        }
      }, 1500)
    })
  }

  const FileListToFileArray = (fileList) => {
    var files = []
    for (let idx = 0; idx < fileList.length; idx++) {
      files.push(fileList[idx])
    }
    return files
  }

  const InvisibleInputFile = () => (
    <input
      id="input-files-ftc"
      type="file"
      style={{ display: 'none' }}
      onChange={(e) => {
        setFormValores({
          ...formValores,
          files: FileListToFileArray(e.target.files ?? new FileList()),
        })
        setEstado({ ...estado, files: true })
      }}
      accept=".png,.jpeg,.jpg,.webp"
      disabled={!editable}
    />
  )

  const addLearning = async (json) => {
    setIsLoadingAdd(true)
    if (!json.name || !json.name.length) { 
        setIsLoadingAdd(false); 
        return
    }
    const response = await CourseAPI.registerLearning(json)
    if (response.status === HttpStatus.OK) {
        refreshLearnings()
        setIsLoadingAdd(false)
    }
    setIsLoadingAdd(false)
  }

  const rmLearning = async (id) => {
    const updatedIsLoading = [...isLoadingRemove];
    updatedIsLoading[id] = true;
    setIsLoadingRemove(updatedIsLoading)
    const response = await CourseAPI.deleteLearning(id)
    if (response.status === HttpStatus.OK) {
        refreshLearnings()
        updatedIsLoading[id] = false;
        setIsLoadingRemove(updatedIsLoading);
    }
    updatedIsLoading[id] = false;
    setIsLoadingRemove(updatedIsLoading);
  }

  const refreshLearnings = async () => {
    const response = await CourseAPI.getCourse(id)
    if (response.status === HttpStatus.OK && !!response.data) {
      const course = response.data
      setLearnings([...course.learnings])
    }
  }

  return logged && !!user ? (
    <section className="box-course pb-1 pt-1">
      <Container fluid className="container-new-course container-course mb-5">
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

        <Form className="mt-4">
          <Row>
            <Col lg={12} className="mt-2">
              <h2>Criar novo curso</h2>
            </Col>
            <Col xs={12} lg={7}>
              <Container fluid>
                <Row>
                  <Col xs={12} className="pl0">
                    <Form.Label className="w-100 mt-3">
                      Titulo do curso
                      <Form.Control
                        className="input-title"
                        spellCheck={false}
                        required
                        type="text"
                        placeholder=""
                        value={formValores.title}
                        onChange={setTitle}
                        isValid={estado.title}
                        disabled={!editable}
                        isInvalid={
                          estado.title !== undefined ? !estado.title : undefined
                        }
                        onBlur={() =>
                          setEstado({
                            ...estado,
                            title: formValores.title.trim().length >= 3,
                          })
                        }
                      />
                    </Form.Label>
                  </Col>
                  <Col xs={12} className="pl0">
                    <Form.Label className="w-100 mt-3">
                      Descrição do curso
                      <Form.Control
                        className="input-description"
                        spellCheck="false"
                        required
                        as="textarea"
                        value={formValores.description}
                        onChange={setDescription}
                        isValid={estado.description}
                        disabled={!editable}
                        isInvalid={
                          estado.description !== undefined
                            ? !estado.description
                            : undefined
                        }
                        onBlur={() =>
                          setEstado({
                            ...estado,
                            description:
                              formValores.description.trim().length >= 3,
                          })
                        }
                      />
                    </Form.Label>
                  </Col>
                  <Col xs={12} className="pl0">
                    <Form.Label className="w-100 mt-3">
                      Conteudo do curso
                      <Form.Control
                        className="input-content"
                        spellCheck="false"
                        required
                        as="textarea"
                        value={formValores.content}
                        onChange={setContent}
                        isValid={estado.content}
                        disabled={!editable}
                        isInvalid={
                          estado.content !== undefined
                            ? !estado.content
                            : undefined
                        }
                        onBlur={() =>
                          setEstado({
                            ...estado,
                            content: formValores.content.trim().length >= 3,
                          })
                        }
                      />
                    </Form.Label>
                  </Col>
                </Row>
              </Container>
            </Col>
            <Col xs={12} lg={5}>
              <Container
                fluid
                className="h-100 d-flex flex-column justify-content-between"
              >
                <Row>
                  <Col xs={12} className="mt-3 pr0">
                    <span>Imagem do curso</span>
                    <label htmlFor="input-files-ftc" style={{ width: '100%' }}>
                      <img
                        className={`image-for-input-file ${
                          estado.files === false ? 'error' : ''
                        }`}
                        src={
                          formValores.files.length
                            ? URL.createObjectURL(formValores.files[0])
                            : noImage
                        }
                        style={{
                          width: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          cursor: 'pointer',
                          backgroundColor: 'white',
                        }}
                      />
                    </label>
                  </Col>
                  <Col xs={12} className="file-input-span mb-3">
                    <span
                      className={`${
                        !!estado.files
                          ? 'ok'
                          : estado.files === false
                          ? 'error'
                          : ''
                      }`}
                    >
                      {formValores.files.length > 0
                        ? `${formValores.files.length} ${
                            formValores.files.length > 1
                              ? 'imagens selecionadas'
                              : 'imagem selecionada'
                          }`
                        : 'Nenhuma imagem selecionada'}
                    </span>
                  </Col>
                  <InvisibleInputFile />
                </Row>
                <Row>
                  <Col
                    lg={12}
                    className="mt-3 pr0"
                    style={{
                      display:
                        postFormSuccess !== PostFormStatus.NULL
                          ? 'none'
                          : 'block',
                      paddingBottom: '5px',
                    }}
                  >
                    <Button
                      className="submit-form register-btn w-100"
                      onClick={() => sendForm()}
                      style={{ height: '60px' }}
                      disabled={!editable}
                    >
                      {(!editable && 'Cadastrado') || 'Cadastrar'}
                    </Button>
                  </Col>
                  <Col
                    lg={12}
                    className="col-form-status pr0"
                    style={{
                      display:
                        postFormSuccess === PostFormStatus.NULL
                          ? 'none'
                          : 'block',
                    }}
                  >
                    <Alert
                      className="alert mt-3 form-status"
                      variant={
                        postFormSuccess === PostFormStatus.ENVIADO
                          ? 'success'
                          : postFormSuccess === PostFormStatus.ENVIANDO
                          ? 'primary'
                          : 'danger'
                      }
                    >
                      {postFormSuccess === PostFormStatus.ENVIADO
                        ? 'Curso cadastrado com sucesso !'
                        : postFormSuccess === PostFormStatus.ENVIANDO
                        ? 'Enviando ...'
                        : 'Houve um erro ao cadastrar curso, por favor, tente novamente mais tarde!'}
                    </Alert>
                  </Col>
                </Row>
              </Container>
            </Col>
          </Row>
        </Form>
      </Container>
      {allowLearnings && (
        <Container
          fluid
          className="container-learnings-metadados container-course"
        >
          <Row>
            <Col xs={12} lg={6}>
              <Container fluid className="pl0 pr0">
                <Col xs={12}>
                  <h2>Aprendizados</h2>
                </Col>
                <Row>
                  {learnings?.map((learning) => (
                    <Col
                      xs={12}
                      className="mt-2"
                      style={{ display: 'flex', flexDirection: 'row' }}
                      key={learning.id}
                    >
                      <Form.Control
                        className="input-learning"
                        value={learning.name}
                        disabled={true}
                        style={{ width: '90%' }}
                      />
                      <Button
                        className="remove-learning hover-learning"
                        style={{ width: '50px' }}
                        onClick={() => rmLearning(learning.id)}
                        disabled={isLoadingRemove[learning.id]}
                      >
                        {isLoadingRemove[learning.id] ? (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faTrash} />
                        )}
                      </Button>
                    </Col>
                  ))}
                  <Col xs={12}>
                    <Form>
                      <Form.Label
                        className="label-submit-learning mt-3"
                        style={{ width: '80%' }}
                      >
                        <span>Adicionar novo aprendizado</span>
                        <Form.Control
                          className="input-learning w-100"
                          spellCheck={false}
                          required
                          type="text"
                          placeholder=""
                          value={learningInput}
                          onChange={(e) =>
                            setLearningInput(
                              cut(e?.target?.value ?? learningInput, 128)
                            )
                          }
                        />
                      </Form.Label>
                      <Button
                        className="submit-form-learning hover-learning"
                        style={{ width: '64px' }}
                        onClick={() => {
                          addLearning({ name: learningInput, course: id })
                          setLearningInput('')
                        }}
                        disabled={isLoadingAdd}
                      >
                        {isLoadingAdd ? (
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                          />
                        ) : (
                          <FontAwesomeIcon icon={faAdd} />
                        )}
                      </Button>
                    </Form>
                  </Col>
                </Row>
              </Container>
            </Col>
            <Col xs={12} style={{ paddingTop: '3rem' }}>
              <Container fluid className="pl0 pr0">
                <Col xs={12}>
                  <h2>Aulas</h2>
                </Col>
                <Col xs={12}>
                  <Button
                    className="submit-add-lesson"
                    onClick={() =>
                      navigate(`/professor/courses/${id}/lessons/create`)
                    }
                  >
                    <FontAwesomeIcon icon={faAdd} />
                  </Button>
                </Col>
              </Container>
            </Col>
          </Row>
        </Container>
      )}
    </section>
  ) : (
    <></>
  )
}

export default NewCourseScreen
