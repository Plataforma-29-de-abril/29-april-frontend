import React from 'react';
import './style.css'
import { Navbar, Card, ListGroup, ListGroupItem } from 'react-bootstrap';
import { SiBookstack, SiNotepadplusplus } from 'react-icons/si'
import { FaBookmark, FaUser } from 'react-icons/fa'
import { ImBooks } from 'react-icons/im'
import { GiArchiveRegister } from 'react-icons/gi'
import { TbLogin, TbNote } from 'react-icons/tb'
import { AiFillHome } from 'react-icons/ai'
import { BsKeyFill, BsReverseListColumnsReverse } from 'react-icons/bs'
import { Link, useNavigate } from 'react-router-dom';
import { OnlyNotLogged, StrictRoute } from '../../contexts/StrictRoute';
import { Roles } from '../../api/default';
import logo from '../../assets/images/logo.png';


const NavLinkTo = ({ href, title, icon }) => (
  <ListGroup horizontal>
    <ListGroup.Item
      style={{
        paddingLeft: '5px',
        paddingRight: '0px',
      }}
      className="li"
    >
      {icon}
    </ListGroup.Item>
    <ListGroup.Item className="li">
      <Link
        className="hover-clic"
        style={{ color: '#8a9094' }}
        to={href}
      >
        {title}
      </Link>
    </ListGroup.Item>
  </ListGroup>
)

const NavText = ({ text }) => (
  <Navbar.Text
    className="fw-bold"
    style={{
      fontSize: 'x-small',
      color: '#b4bbbf',
      paddingLeft: '16px',
    }}
  >
    {text}
  </Navbar.Text>
)

const NavGroupFlush = ({ children }) => (
  <ListGroup variant="flush">
    <ListGroupItem
      className="list"
      style={{
        paddingLeft: '15px',
        paddingRight: '0px',
      }}
    >
      {children}
    </ListGroupItem>
  </ListGroup>
)

const FAIcon = ({ Icon }) => (
  <Icon style={{ color: '#8a9094', fontSize: '18' }} className="me-2" />
)

const SideNav = () => {
  const navigate = useNavigate();
  return (
      <Navbar className='home-desktop show-desktop-version'>
        <Card className='cardSide'>
          <Card.Img className="cardSide-img-top mx-auto mt-2" variant="top" onClick={()=> navigate("/")} src={logo} />

          <Card.Body
            style={{
              paddingLeft: '0px',
              paddingRRight: '0px',
            }}
          >
            <NavText text='GERAL' />
            <NavGroupFlush>
              <NavLinkTo title='Home' href='/' icon={<FAIcon Icon={AiFillHome} />} />
              <StrictRoute roles={[Roles.STUDENT, Roles.ADMIN, Roles.PROFESSOR]}>
                <NavLinkTo title='Meu Perfil' href='/perfil' icon={<FAIcon Icon={FaUser} />} />
              </StrictRoute>
              <OnlyNotLogged>
                <NavLinkTo title='Cadastre-se' href='/register' icon={<FAIcon Icon={GiArchiveRegister} />} />
                <NavLinkTo title='Logar-se' href='/login' icon={<FAIcon Icon={TbLogin} />} />
              </OnlyNotLogged>
            </NavGroupFlush>

            <StrictRoute roles={[Roles.STUDENT]}>
              <NavText text='ALUNO' />
              <NavGroupFlush>
                {/* <NavLinkTo title='Cursos' href='/student/courses' icon={<FAIcon Icon={ImBooks} />} /> */}
                {/* <NavLinkTo title='Minhas Notas' href='/student/notes' icon={<FAIcon Icon={TbNote} />} /> */}
                <NavLinkTo title='Favoritos' href='/student/marked-courses' icon={<FAIcon Icon={FaBookmark} />} />
                <NavLinkTo title='Meus cursos' href='/student/enrolled-courses' icon={<FAIcon Icon={SiBookstack} />} />
              </NavGroupFlush>
            </StrictRoute>


            <StrictRoute roles={[Roles.PROFESSOR]}>
              <NavText text='PROFESSOR' />
              <NavGroupFlush>
                <NavLinkTo title='Meus cursos' href='/professor/courses' icon={<FAIcon Icon={ImBooks} />} />
                <NavLinkTo title='Criar curso' href='/professor/courses/create' icon={<FAIcon Icon={SiBookstack} />} />
              </NavGroupFlush>
            </StrictRoute>

            <StrictRoute roles={[Roles.ADMIN]}>
              <NavText text='ADMIN' />
              <NavGroupFlush>
                <NavLinkTo title='Gerar Convite' href='/admin/generate-invite' icon={<FAIcon Icon={BsKeyFill} />} />
                <NavLinkTo title='Gerenciar Professores' href='/admin/manage-teachers' icon={<FAIcon Icon={BsReverseListColumnsReverse} />} />
              </NavGroupFlush>
            </StrictRoute>
            
          </Card.Body>
          <StrictRoute roles={[Roles.STUDENT, Roles.ADMIN, Roles.PROFESSOR]}>
            <Card.Footer style={{backgroundColor: "white"}}>
              <NavLinkTo title='Sair' href='/logout' icon={<FAIcon Icon={TbLogin} />} />
            </Card.Footer>
          </StrictRoute>
        </Card>
      </Navbar>
    );
  }

  export default SideNav;
