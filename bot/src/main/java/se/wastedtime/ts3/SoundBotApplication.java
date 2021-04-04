package se.wastedtime.ts3;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import se.wastedtime.ts3.core.DatabaseService;

@SpringBootApplication
@Slf4j
@EnableScheduling
@EnableWebSecurity
@CrossOrigin
public class SoundBotApplication extends WebSecurityConfigurerAdapter implements WebMvcConfigurer {

    private final DatabaseService database;

    @Autowired
    public SoundBotApplication(DatabaseService database) {
        this.database = database;
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.cors().and().authorizeRequests().anyRequest().permitAll();
    }

    public static void main(String[] args) {
        SpringApplication.run(SoundBotApplication.class, args);
    }

}
