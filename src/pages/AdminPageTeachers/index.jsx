import React, { useEffect, useState } from 'react'

import './style.css'

import { Col, Container, Navbar, Row, Card, Button, Form, ListGroup, ListGroupItem, Spinner } from 'react-bootstrap'
import Avatar from 'react-avatar'
import { useAuthContext } from '../../contexts/AuthContext'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCancel, faCode, faEnvelope, faRemove, faShare } from '@fortawesome/free-solid-svg-icons'
import { HttpStatus } from '../../api/default'
import { AdminAPI } from '../../api/admin'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom'


const AdministrateTeachers = () => {
    const { user, token } = useAuthContext();
    const [newCode, setNewCode] = useState("")
    const [email, setEmail] = useState("")
    const [teachers, setTeachers] = useState([]);
    const [enableBtn, setEnableBtn] = useState(true)
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingEmail, setIsLoadingEmail] = useState(false)
    const navigate = useNavigate();

    const notifySuccess = () => toast.success("E-mail enviado com sucesso.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });

    const notifyError = (texto) => toast.error(texto, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });

    useEffect(() => {
        requestTeachers()
    }, []);

    const seeProfile = (id) => {
        navigate("/student/courses/professor/" + id);
    }

    const revokePermissions = async (id) => {
        const response = await AdminAPI.revokePermissions(token, id);

        if (response.status !== HttpStatus.OK) {
            notifyError("Falha ao revogar permissão.");
        }else{
            requestTeachers();
        }
    }

    const requestTeachers = async () => {
        const listTeachers = await AdminAPI.fetchTeachers(token);

        if (listTeachers.status !== HttpStatus.OK) {
            notifyError("Falha ao requisitar lista de professores.");
        }else{
            setTeachers(listTeachers.data);
        }
    }

    return (
        <>
            <Navbar style={{ marginBottom: '50px' }}>
                <Container fluid>
                    <p style={{ color: '#0f5b7a' }} className="mt-3 fs-6 fw-bold">
                        &#128075;&nbsp; Hey, Administrador!
                    </p>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Navbar.Text>
                            <Avatar
                                class
                                name={user?.name}
                                color="#0f5b7a"
                                size={30}
                                textSizeRatio={2}
                                round={true}
                            />
                        </Navbar.Text>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container fluid className='mb-3'>
                <Row className="d-flex justify-content-center gap-4">

                    <Col>


                        {teachers.length ?
                            <Row>
                                <Card
                                    style={{
                                        padding: '16px',
                                    }}
                                >
                                    <Row className="mb-4">
                                        <Col className="d-flex justify-content-between align-items-center">
                                            <h1 className="fw-bold fs-5" style={{ color: '#727273' }}>
                                                Professores Cadastrados:
                                            </h1>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col>
                                            <ListGroup>
                                                {teachers.map(teacher => <ListGroupItem key={teacher.id} style={{ display: "flex" }}>
                                                    <span className="code-span box">{teacher.name}</span>
                                                    <span className='box'>
                                                        <span>{teacher.email}</span>
                                                    </span>
                                                    <span className='box'><span style={{ cursor: "pointer" }} onClick={() => seeProfile(teacher.id)} className='share'>Ver Perfil <FontAwesomeIcon
                                                        style={{ color: 'white', fontSize: '16' }}
                                                        icon={faShare}
                                                    /></span></span>
                                                    <span style={{ cursor: "pointer" }} onClick={() => revokePermissions(teacher.id)} className='delete'>Revogar Permissões <FontAwesomeIcon
                                                        style={{ color: 'white', fontSize: '16' }}
                                                        icon={faRemove}
                                                    /></span>
                                                </ListGroupItem>)}
                                            </ListGroup>
                                        </Col>
                                    </Row>
                                </Card>
                            </Row> : <></>
                        }
                    </Col>
                </Row>
            </Container>
        </>
    )
}

export default AdministrateTeachers
