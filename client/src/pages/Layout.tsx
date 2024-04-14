import { Link, Outlet } from 'react-router-dom';
import BasicMenu from '../components/BasicMenu';
import IMAGES from '../images/Images';
import { Paper } from '@mui/material';

const Layout = () => {
	return (
		<>
			<nav>
				<div style={{ display: 'flex', justifyContent: 'space-between' }}>
					<Link to="/">
						<img
							src={IMAGES.autosslLogo}
							alt="AutoSSL"
							style={{ width: 200, height: 'auto', borderRadius: 1 }}
						/>
					</Link>
					<BasicMenu />
				</div>
			</nav>
			<Paper
				elevation={3}
				sx={{ width: '90%', marginLeft: '5%', marginRight: '5%' }}
			>
				<Outlet />
			</Paper>
		</>
	);
};

export default Layout;
