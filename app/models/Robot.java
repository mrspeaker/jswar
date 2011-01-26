package models;

import java.util.Date;
import java.util.List;

import javax.persistence.Entity;

import play.db.jpa.Model;

@Entity
public class Robot extends Model {
	
	public String userId;
	
	public String name;
	
	public String script;
	
	public String localScript;
	
	public Date date;

	public Robot(String userid) {
		userId = userid;
	}
	
	public static Robot findOrCreate(String userid) {
		Robot robot = Robot.find("userId = ?1", userid).first();
		if(robot==null) {
			robot = new Robot(userid);
			robot.save();
		}
		return robot;
	}

	public static List<Robot> getRobots(Integer limit) {
		return find("script is not null and script <> '' order by date desc").fetch(limit);
	}
}
