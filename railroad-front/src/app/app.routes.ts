import { Routes } from '@angular/router';
import { ConnectWalletComponent } from './connect-wallet/connect-wallet.component';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [

    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: 'login',
        component: ConnectWalletComponent,
    }, 
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard] 
    },

];
