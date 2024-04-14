/*
  Notes:
    - More options menu could lead to a configuration page for the servers,
      with its agent configuration, delete option, etc...
		- Maybe I could use pass menu options through props to reuse a optionsmenu component
*/

import * as React from 'react';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { Link } from 'react-router-dom';
import StyledMenu from './StyledMenu';

const ServerOptionsMenu: React.FC<{ serverId: string }> = ({
	serverId,
}: {
	serverId: string;
}) => {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		<div>
			<Button
				id="demo-customized-button"
				aria-controls={open ? 'demo-customized-menu' : undefined}
				aria-haspopup="true"
				aria-expanded={open ? 'true' : undefined}
				variant="contained"
				disableElevation
				onClick={handleClick}
				endIcon={<KeyboardArrowDownIcon />}
			>
				Options
			</Button>
			<StyledMenu
				id="demo-customized-menu"
				MenuListProps={{
					'aria-labelledby': 'demo-customized-button',
				}}
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
			>
				<MenuItem
					onClick={handleClose}
					disableRipple
					component={Link}
					to={`/servers/${serverId}/web-servers`}
				>
					Web Servers
				</MenuItem>
				<MenuItem onClick={handleClose} disableRipple>
					Domains
				</MenuItem>
				<MenuItem onClick={handleClose} disableRipple>
					Certificates
				</MenuItem>
				<Divider sx={{ my: 0.5 }} />
				<MenuItem onClick={handleClose} disableRipple>
					<MoreHorizIcon />
					More
				</MenuItem>
			</StyledMenu>
		</div>
	);
};

export default ServerOptionsMenu;
