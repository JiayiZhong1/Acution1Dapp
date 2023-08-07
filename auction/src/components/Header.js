import {
  AppstoreOutlined,
  StarOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from "react-router-dom";

const { Header } = Layout;

const sideConfig = [
  {
      key: 'all',
      icon: <AppstoreOutlined />,
      label: 'All Auctions',
  },
  {
      key: 'my',
      icon: <StarOutlined />,
      label: 'My Auctions',
  },
  {
      key: 'myInvestment',
      icon: <StarOutlined />,
      label: 'My Bid',
  },
]

const HeaderComponent = ({colorBgContainer}) => {

  const navigate = useNavigate();
    const local = useLocation()

    const handleClick = ({item, key, keyPath, domEvent}) => {
        switch(key) {
            case "home":
                return navigate('/')
            case "all":
                return navigate('/all')
            case "my": 
                return navigate('/my')
            case 'myInvestment':
                return navigate('/myInvestment')
            default: {
                navigate('/')
            }
        }
    }


    return (
        <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              display: 'flex'
            }}
          >
            
            {/* <div className="logo">
                <img src={Logo} />
            </div> */}
            {/* 侧边栏 */}
            <Menu
                // theme="dark"
                mode="horizontal"
                defaultSelectedKeys={[local.pathname.replace('/', '') || 'home']}
                onClick={handleClick}
                items={sideConfig}
            />
          </Header>
    )
}

export default HeaderComponent