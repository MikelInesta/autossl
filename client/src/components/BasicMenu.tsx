import * as React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';

export default function BasicMenu() {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<div style={{ margin: '20px' }}>
			<Button
				id="basic-button"
				aria-controls={open ? 'basic-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				onClick={handleClick}
			>
				Tools
			</Button>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					'aria-labelledby': 'basic-button',
				}}
			>
				<MenuItem onClick={handleClose}>
					<Link to="/">Home</Link>
				</MenuItem>
				<MenuItem onClick={handleClose}>
					<Link to="/servers">Servers</Link>
				</MenuItem>
				<MenuItem onClick={handleClose}>
					<Link to="/web-servers">Web Servers</Link>
				</MenuItem>
				<MenuItem onClick={handleClose}>
					<Link to="/virtual-hosts">Domains</Link>
				</MenuItem>
				<MenuItem onClick={handleClose}>
					<Link to="/certificates">Certificates</Link>
				</MenuItem>
			</Menu>
		</div>
	);
}
