package uz.itpu.cherrycake.security;

import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import uz.itpu.cherrycake.model.entity.User;
import uz.itpu.cherrycake.repository.UserRepository;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService
{
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException
    {
        User user = userRepository.findByEmailIgnoreCase(email).orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(user.getEmail(), user.getPasswordHash(), Collections.singletonList(new SimpleGrantedAuthority(user.getRole())));
    }
}